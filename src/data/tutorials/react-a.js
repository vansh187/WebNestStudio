// React Basics module A — hand-written lesson content.
// Keys are the topic slugs used by the React tutorial's topics list.
export const reactContentA = {
  jsx: {
    title: 'JSX Syntax in React',
    intro: `JSX (JavaScript XML) is a syntax extension that lets you write HTML-like markup directly inside JavaScript. It is not a separate template language and it is not required to use React, but it is by far the most common way to describe UI in React applications because it reads almost exactly like the HTML it produces.

Under the hood, JSX is not understood by browsers at all. A build tool such as Babel transforms every JSX element into a plain JavaScript function call — historically \`React.createElement(type, props, ...children)\`, and in modern tooling the newer automatic JSX runtime (\`_jsx\`/\`jsx\` from \`react/jsx-runtime\`). Either way, JSX is purely syntax sugar: \`<h1>Hello</h1>\` compiles down to a function call that returns a plain JavaScript object describing that element, which React then uses to build and update the actual DOM.`,
    sections: [
      {
        heading: 'JSX Compiles to Function Calls',
        body: `Every piece of JSX you write is converted at build time into a call that creates a React element object. Understanding this equivalence explains many JSX rules that otherwise look arbitrary.`,
        list: [
          '<code>&lt;h1&gt;Hello&lt;/h1&gt;</code> compiles roughly to <code>React.createElement("h1", null, "Hello")</code>.',
          'A React element is a plain JavaScript object with a <code>type</code>, <code>props</code>, and <code>children</code> — it is not a DOM node.',
          'Because JSX is just function calls, you can freely mix it with normal JavaScript: variables, conditionals, and loops all work around it.',
        ],
      },
      {
        heading: 'Embedding Expressions with Curly Braces',
        body: `Anything inside curly braces <code>{}</code> in JSX is evaluated as a JavaScript expression, and the result is inserted into the output. This works for variables, function calls, arithmetic, ternaries, and object property access — but not for statements like <code>if</code> or <code>for</code>, since those are not expressions. Attribute values also accept <code>{}</code> for dynamic values, for example <code>&lt;img src={imageUrl} /&gt;</code>.`,
      },
      {
        heading: 'The Single Root Element Rule',
        body: `A JSX expression must resolve to exactly one root element, because it ultimately becomes a single function call returning a single element object. Returning two sibling elements without a wrapper is a compile error. React provides a lightweight fragment, written as <code>&lt;&gt;...&lt;/&gt;</code> or explicitly <code>&lt;React.Fragment&gt;...&lt;/React.Fragment&gt;</code>, to group multiple elements without adding an extra DOM node like a <code>&lt;div&gt;</code>.`,
      },
      {
        heading: 'JSX Attribute Differences from HTML',
        body: `JSX attributes use camelCase for most DOM properties (<code>onClick</code>, <code>tabIndex</code>, <code>className</code> instead of <code>class</code>) because they map to JavaScript object properties, not HTML attribute strings. Self-closing tags must include the trailing slash, for example <code>&lt;br /&gt;</code> and <code>&lt;img /&gt;</code>, even for elements that are optional in raw HTML.`,
      },
    ],
    examples: [
      {
        caption: 'JSX expressions, attributes, and a single wrapping fragment',
        code: `function Greeting({ name, isLoggedIn }) {
  const currentHour = new Date().getHours();
  const greetingWord = currentHour < 12 ? 'Good morning' : 'Good evening';

  return (
    <>
      <h1 className="greeting-title">
        {greetingWord}, {name}!
      </h1>
      {isLoggedIn && <p>You are logged in.</p>}
    </>
  );
}

export default function App() {
  return <Greeting name="Asha" isLoggedIn={true} />;
}`,
        output: 'Renders an <h1> reading "Good morning, Asha!" (or "Good evening, Asha!" depending on the time), followed by a paragraph "You are logged in." because isLoggedIn is true — with no extra wrapping DOM element thanks to the fragment.',
      },
    ],
    commonMistakes: [
      'Returning two sibling elements from a component without wrapping them in a single parent or fragment, causing a "JSX expressions must have one parent element" error.',
      'Using the HTML attribute "class" instead of the JSX prop "className" — React will silently ignore "class" on DOM elements.',
      'Trying to put a JavaScript statement like an if block directly inside curly braces — curly braces only accept expressions, so conditionals must be rewritten as ternaries or moved outside the JSX.',
      'Forgetting that JSX compiles to function calls, then being confused about why a component must return a single value.',
    ],
    keyPoints: [
      'JSX is syntax sugar that compiles to React.createElement (or the automatic JSX runtime) calls, producing plain JavaScript objects.',
      'Curly braces {} embed any valid JavaScript expression into JSX markup or attributes.',
      'A component must return one root element; use fragments (<>...</>) to group siblings without adding extra DOM nodes.',
      'JSX attributes use camelCase and map to DOM properties, not raw HTML attribute strings.',
    ],
  },

  components: {
    title: 'React Components',
    intro: `A component is a self-contained, reusable piece of UI described as a JavaScript function that returns JSX. Components are the fundamental building block of every React application — a whole app is really just a tree of components nested inside one another, starting from a single root component rendered into the page.

Modern React code is written almost entirely with function components rather than the older class-based components. A function component is simply a JavaScript function whose name starts with a capital letter and which returns JSX describing what should appear on screen. Capitalization matters: React treats lowercase tags like <code>&lt;div&gt;</code> as built-in HTML elements and capitalized tags like <code>&lt;UserCard /&gt;</code> as references to your own components.`,
    sections: [
      {
        heading: 'Writing a Function Component',
        body: `A function component takes a single object of props as its argument (often destructured directly in the parameter list) and returns JSX. It can contain plain JavaScript logic above the return statement — computing values, calling hooks, formatting data — before describing the resulting markup.`,
      },
      {
        heading: 'Composition Over Inheritance',
        body: `React favors composition: instead of building deep class hierarchies, you build UI by nesting smaller components inside larger ones and passing data or even other components through props. A component can render other components, which in turn render more components, forming a tree that mirrors the structure of the rendered page.`,
      },
      {
        heading: 'Splitting UI into Small Components',
        body: `Breaking a large UI into small, focused components keeps each piece easy to understand, test, and reuse. A good rule of thumb is that if a chunk of JSX represents one clear concept (a card, a button, a form field) or is duplicated in more than one place, it is a good candidate to extract into its own component.`,
        list: [
          'Each component should ideally do one thing — rendering a user profile, a single list item, or a navigation bar — rather than mixing many unrelated responsibilities.',
          'Small components are easier to give clear prop interfaces to, which makes their behavior predictable from the outside.',
          'Component trees make it easy to reuse the same building block in many places, such as a Button or Card component used across an entire application.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A parent component composed from two smaller child components',
        code: `function Avatar({ src, alt }) {
  return <img className="avatar" src={src} alt={alt} width={48} height={48} />;
}

function UserName({ name, title }) {
  return (
    <div>
      <strong>{name}</strong>
      <p>{title}</p>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatarUrl} alt={user.name} />
      <UserName name={user.name} title={user.title} />
    </div>
  );
}

export default function App() {
  const user = { name: 'Priya Rao', title: 'Frontend Engineer', avatarUrl: '/priya.jpg' };
  return <UserCard user={user} />;
}`,
        output: 'Renders a "user-card" container showing a 48x48 avatar image next to the bold name "Priya Rao" and the subtitle "Frontend Engineer", built by composing three separate components (Avatar, UserName, UserCard).',
      },
    ],
    commonMistakes: [
      'Starting a component function name with a lowercase letter, which makes React treat it as an unrecognized HTML tag instead of a component.',
      'Cramming an entire page into one giant component instead of splitting it into smaller, focused pieces.',
      'Defining a component function inside the body of another component (rather than at module scope), which causes it to be recreated on every render and lose its state.',
      'Returning nothing (undefined) from a component instead of null or valid JSX, which throws a rendering error.',
    ],
    keyPoints: [
      'A React component is a capitalized JavaScript function that returns JSX describing part of the UI.',
      'Applications are built as a tree of components composed inside one another, not through class inheritance.',
      'Splitting UI into small, focused components improves reuse, readability, and testability.',
      'Component functions should be defined at the top level of a module, not nested inside another component.',
    ],
  },

  props: {
    title: 'Props in React',
    intro: `Props (short for "properties") are how data flows from a parent component into a child component. They work like function arguments: a parent passes values through JSX attributes, and the child receives all of them bundled into a single object, conventionally named <code>props</code>.

Props always flow in one direction, from parent to child — this is called "one-way data flow" or "unidirectional data flow." A child component can read the props it receives, but it can never modify them; props are read-only from the child's perspective. If a component needs to change data over time, that data belongs in state, not in a prop the component itself owns.`,
    sections: [
      {
        heading: 'Passing and Reading Props',
        body: `A parent passes props exactly like HTML attributes: <code>&lt;Greeting name="Asha" age={28} /&gt;</code>. The child receives a single props object, <code>{ name: "Asha", age: 28 }</code>, which it can access as <code>props.name</code> or, more commonly, destructure directly in the function signature as <code>function Greeting({ name, age })</code>.`,
      },
      {
        heading: 'Props Are Read-Only',
        body: `React enforces that components must never mutate their own props. This "purity" rule keeps data flow predictable: given the same props, a component should always render the same output. If you find yourself wanting to reassign a prop inside a component, that is a signal the value should instead be copied into local state, or the change should be lifted up and handled by the parent that owns the data.`,
      },
      {
        heading: 'Default Values, children, and Prop Types',
        body: `Function components can specify default values for props using default parameters, for example <code>function Button({ label = "Click me" })</code>. The special prop <code>children</code> contains whatever JSX is nested between a component's opening and closing tags, which is how wrapper components like layout containers or modals render arbitrary content passed to them. In JavaScript projects, tools like PropTypes or TypeScript interfaces are commonly used to document and validate the shape of expected props.`,
      },
    ],
    examples: [
      {
        caption: 'Passing props down, using defaults, and rendering children',
        code: `function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </section>
  );
}

function PriceTag({ amount, currency = 'USD' }) {
  return <span>{amount.toFixed(2)} {currency}</span>;
}

export default function ProductPage() {
  return (
    <Card title="Wireless Headphones">
      <p>Noise-cancelling, 30-hour battery life.</p>
      <PriceTag amount={79.5} />
    </Card>
  );
}`,
        output: 'Renders a card section titled "Wireless Headphones" containing the description paragraph and a price tag reading "79.50 USD" — the currency defaulted to USD because PriceTag was not given one explicitly.',
      },
    ],
    commonMistakes: [
      'Attempting to reassign a prop value inside a child component (e.g. "props.name = \'new value\'") instead of treating props as read-only input.',
      'Forgetting that a prop not passed by the parent is undefined unless a default value is defined, then calling a method on it and crashing.',
      'Passing an entire object as one prop and then destructuring it awkwardly inside the child, instead of passing only the specific fields the child actually needs.',
      'Confusing props (data passed in from a parent) with state (data a component manages internally) and trying to update a prop directly to trigger a re-render.',
    ],
    keyPoints: [
      'Props pass data one-way, from a parent component down to a child component, via JSX attributes.',
      'Props are read-only — a component must never mutate the props object it receives.',
      'Default parameter values give a prop a fallback when the parent does not supply one.',
      'The special children prop carries whatever JSX is nested inside a component\'s tags.',
    ],
  },

  state: {
    title: 'State and the useState Hook',
    intro: `State is data that a component owns and manages internally, which can change over time in response to user actions, network responses, or timers. Unlike props, which are handed down from a parent, state lives inside the component itself and is completely private to it unless explicitly shared.

The <code>useState</code> hook is the primary way function components create and manage state. Calling <code>useState(initialValue)</code> returns a pair — the current state value and a setter function to update it — and, critically, calling that setter schedules a re-render of the component so the UI stays in sync with the latest data.`,
    sections: [
      {
        heading: 'Declaring State with useState',
        body: `<code>const [count, setCount] = useState(0);</code> declares a piece of state named <code>count</code>, initialized to <code>0</code>, along with a function <code>setCount</code> used to update it. The array destructuring syntax is just a convention; useState technically returns a two-element array, and you name both elements yourself.`,
      },
      {
        heading: 'State Updates Trigger Re-Renders',
        body: `Calling the setter function (e.g. <code>setCount(count + 1)</code>) tells React that this component's state has changed. React then re-runs the component function to compute new JSX and efficiently updates the real DOM to match. This is the core rendering model of React: state changes in, new UI out, automatically.`,
      },
      {
        heading: 'State Is Local and Isolated Per Component Instance',
        body: `Each time a component is rendered as a separate instance (for example, multiple <code>&lt;Counter /&gt;</code> elements on the same page), each instance gets its own independent state. Updating one instance's state does not affect any other instance's state, even though they share the same component definition.`,
        list: [
          'Never mutate state directly (e.g. <code>count = count + 1</code>) — always call the setter function, since direct mutation will not trigger a re-render.',
          'When new state depends on the previous state, prefer the updater-function form, <code>setCount(prev => prev + 1)</code>, to avoid stale values in rapid or batched updates.',
          'Initializing useState with an expensive computation should use the lazy initializer form, <code>useState(() => computeInitial())</code>, so the computation only runs once.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A simple counter component managed entirely with useState',
        code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount((prev) => prev + 1);
  }

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}

export default Counter;`,
        output: 'Clicking the "Increment" button repeatedly increases the number shown in "Current count: 0" up through 1, 2, 3, and so on, because each click calls setCount and triggers a re-render with the updated value.',
      },
    ],
    commonMistakes: [
      'Mutating state directly (e.g. "count++" or pushing into a state array) instead of calling the setter function — React will not detect the change and the UI will not update.',
      'Reading the state variable itself to compute the next value in rapid succession (e.g. calling setCount(count + 1) twice in a row) instead of using the updater function form, which can produce stale results.',
      'Expecting the state variable to update immediately after calling the setter within the same function — state updates are scheduled and the new value is only available on the next render.',
      'Creating too many separate useState calls for values that are really one related object, making updates harder to keep in sync.',
    ],
    keyPoints: [
      'useState(initialValue) returns [currentValue, setterFunction] for a piece of component-local state.',
      'Calling the setter schedules a re-render so the rendered UI reflects the new state.',
      'State must never be mutated directly; always update it through its setter function.',
      'Each component instance has its own independent, isolated state.',
    ],
  },

  events: {
    title: 'Handling Events in React',
    intro: `React lets you respond to user interactions — clicks, typing, form submissions, mouse movement — by attaching event handler functions directly to JSX elements. Event handling in React looks similar to plain HTML's inline event attributes, but it works differently under the hood and follows JavaScript naming conventions instead of HTML ones.

Instead of lowercase HTML attributes like <code>onclick="..."</code> with a string of code, React uses camelCase props like <code>onClick={handleClick}</code>, where the value is an actual JavaScript function reference, not a string to be evaluated.`,
    sections: [
      {
        heading: 'Attaching Event Handlers',
        body: `Common event props include <code>onClick</code> for clicks, <code>onChange</code> for input value changes, <code>onSubmit</code> for form submissions, and <code>onMouseOver</code>, <code>onKeyDown</code>, and many others that mirror native DOM events. You pass a function reference, not a function call: <code>onClick={handleClick}</code> is correct, while <code>onClick={handleClick()}</code> would incorrectly invoke the function immediately during render instead of waiting for the click.`,
      },
      {
        heading: 'Synthetic Events',
        body: `React wraps native browser events in a cross-browser wrapper called a SyntheticEvent, which normalizes behavior across different browsers and provides the same familiar API (<code>event.target</code>, <code>event.preventDefault()</code>, <code>event.stopPropagation()</code>) regardless of which underlying browser event actually fired. This means you can write one consistent set of event-handling code without worrying about browser-specific quirks.`,
      },
      {
        heading: 'Passing Arguments to Handlers',
        body: `Because <code>onClick</code> expects a function reference, passing extra arguments requires wrapping the call in an inline arrow function, for example <code>onClick={() => handleDelete(item.id)}</code>. This creates a new function on every render, which is usually fine for typical UI interactions, though it is something to be mindful of in performance-sensitive lists.`,
      },
    ],
    examples: [
      {
        caption: 'Handling a click event and a form submission with preventDefault',
        code: `import { useState } from 'react';

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault(); // stops the browser's default full-page reload
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <button type="submit">Subscribe</button>
      {submitted && <p>Thanks, {email}! You are subscribed.</p>}
    </form>
  );
}

export default SubscribeForm;`,
        output: 'Typing into the input updates the field as you type; clicking "Subscribe" prevents the page from reloading and instead shows "Thanks, you@example.com! You are subscribed." below the form.',
      },
    ],
    commonMistakes: [
      'Writing onClick={handleClick()} instead of onClick={handleClick}, which calls the function immediately during rendering rather than when the element is clicked.',
      'Forgetting to call event.preventDefault() inside a form\'s onSubmit handler, causing an unwanted full-page reload.',
      'Assuming React event handlers receive the raw native browser event with no differences — React actually passes a SyntheticEvent wrapper with a normalized API.',
      'Defining a new inline arrow function for every list item\'s handler without considering the performance cost in very large, frequently re-rendered lists.',
    ],
    keyPoints: [
      'React event props use camelCase (onClick, onChange, onSubmit) and take a function reference, not a string.',
      'React wraps native browser events in SyntheticEvents for consistent cross-browser behavior.',
      'Use event.preventDefault() to stop default browser behavior, such as a form causing a page reload.',
      'Wrap a handler in an inline arrow function when it needs extra arguments beyond the event object.',
    ],
  },

  'conditional-rendering': {
    title: 'Conditional Rendering in React',
    intro: `Conditional rendering means showing different UI depending on some condition — a loading state, whether a user is logged in, whether a list is empty. Because JSX is just JavaScript, you don't need a special templating syntax for this; you use ordinary JavaScript conditional constructs directly inside or around your JSX.

The two most common patterns are the ternary operator for choosing between two alternatives, and the logical AND (<code>&&</code>) operator for rendering something only when a condition is true, with nothing rendered otherwise.`,
    sections: [
      {
        heading: 'Ternary Operator for Either/Or Rendering',
        body: `When you need to render one of exactly two possible outputs, the ternary operator <code>condition ? &lt;ThenThis /&gt; : &lt;ElseThis /&gt;</code> fits neatly inside curly braces because, unlike an if/else statement, a ternary is a single expression that evaluates to a value.`,
      },
      {
        heading: 'Logical AND for Optional Rendering',
        body: `When there is no "else" case — you either show something or show nothing — the <code>&&</code> operator is more concise: <code>{isLoggedIn && &lt;WelcomeBanner /&gt;}</code> renders the banner only when <code>isLoggedIn</code> is truthy. Because <code>&&</code> returns its left operand when that operand is falsy, care is needed with numeric values: <code>{count && &lt;List /&gt;}</code> would render the literal number <code>0</code> to the page when count is 0, since 0 is falsy but not undefined.`,
      },
      {
        heading: 'Early Returns and Variable-Based Rendering',
        body: `For more complex logic, it is often clearer to compute the JSX to render into a variable before the return statement, or to return early from the component function entirely for special cases like a loading or error state, keeping the main return statement focused on the "happy path" UI.`,
        list: [
          'Use a ternary for exactly two branches directly inside JSX.',
          'Use && for "render this, or render nothing" cases, guarding against falsy-but-not-boolean values like 0 or an empty string.',
          'Use an early return at the top of the component for entirely different UI states, such as a loading spinner or an error message.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Combining an early return, a ternary, and && in one component',
        code: `function OrderStatus({ isLoading, isPaid, itemCount }) {
  if (isLoading) {
    return <p>Loading order...</p>;
  }

  return (
    <div>
      <p>{isPaid ? 'Payment received' : 'Payment pending'}</p>
      {itemCount > 0 && <p>{itemCount} item(s) in this order.</p>}
    </div>
  );
}

export default function App() {
  return <OrderStatus isLoading={false} isPaid={true} itemCount={3} />;
}`,
        output: 'Because isLoading is false, the early-return loading message is skipped; the ternary renders "Payment received" (isPaid is true); and since itemCount (3) is greater than 0, "3 item(s) in this order." is also rendered below it.',
      },
    ],
    commonMistakes: [
      'Using {count && <List items={items} />} when count can be 0, which renders a stray "0" on the page instead of nothing, because 0 is falsy but && returns it as-is.',
      'Nesting several ternary operators inside JSX until the logic becomes unreadable — extracting the decision into a variable or a helper function is usually clearer.',
      'Trying to use an if statement directly inside curly braces in JSX, which is a syntax error because if is a statement, not an expression.',
      'Forgetting to handle the loading or error state at all, letting the component try to render data that has not arrived yet and crash.',
    ],
    keyPoints: [
      'Conditional rendering uses ordinary JavaScript expressions (ternary, &&) inside JSX, not a separate templating syntax.',
      'The ternary operator condition ? a : b is the standard tool for choosing between two rendering options.',
      'The && operator renders its right-hand side only when the left-hand side is truthy — watch out for falsy numbers like 0.',
      'Early returns at the top of a component keep the main JSX focused on the primary rendering case.',
    ],
  },

  'lists-keys': {
    title: 'Rendering Lists with map() and Keys',
    intro: `React does not have a special loop syntax for rendering repeated UI; instead, you use the standard JavaScript array method <code>.map()</code> to transform an array of data into an array of JSX elements, which React can then render directly as siblings.

Whenever you render a list of elements this way, each element needs a special <code>key</code> prop — a stable, unique string or number identifying that item among its siblings. Keys are not visible in the rendered output; they exist purely to help React's reconciliation algorithm track which items changed, were added, or were removed between renders.`,
    sections: [
      {
        heading: 'Transforming Data into JSX with map()',
        body: `Given an array of data, <code>array.map(item => &lt;li key={item.id}&gt;{item.name}&lt;/li&gt;)</code> produces a new array of <code>&lt;li&gt;</code> elements, one per data item, which can be placed directly inside a parent element like <code>&lt;ul&gt;</code>.`,
      },
      {
        heading: 'Why Keys Matter for Reconciliation',
        body: `When state or props change, React compares the new list of elements to the previous one to figure out the minimal set of DOM changes needed. Keys let React match up elements across renders by identity rather than by position, so if an item is removed from the middle of a list, React can correctly remove just that one DOM node and reuse the rest — preserving component state, focus, and input values that belong to the untouched items. Without stable keys (or when using the array index as a key on a list that can reorder), React can misattribute state between items, causing subtle bugs like text staying in the wrong input field after a reorder.`,
      },
      {
        heading: 'Choosing a Good Key',
        body: `A key should come from the data itself — a database ID, a unique slug, or another value that stays constant across renders and re-orderings for a given logical item. Using the array index as a key is only safe when the list is static, never reordered, and never filtered.`,
        list: [
          'Keys only need to be unique among sibling elements, not globally unique across the whole app.',
          'Keys are used internally by React and are not passed down to the component as a prop — access other identifying data through a normal prop if the component needs it.',
          'Avoid generating a new random key on every render (e.g. Math.random()); this defeats the purpose entirely by making every item look "new" each time.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Rendering a dynamic to-do list with stable keys from item IDs',
        code: `const todos = [
  { id: 'a1', text: 'Buy groceries' },
  { id: 'a2', text: 'Walk the dog' },
  { id: 'a3', text: 'Write React notes' },
];

function TodoList({ items }) {
  return (
    <ul>
      {items.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return <TodoList items={todos} />;
}`,
        output: 'Renders an unordered list with three list items reading "Buy groceries", "Walk the dog", and "Write React notes" in order, each keyed by its stable id (a1, a2, a3) so React can track them correctly if the list changes later.',
      },
    ],
    commonMistakes: [
      'Omitting the key prop entirely, which causes React to log a console warning and fall back to less reliable positional matching.',
      'Using the array index as a key for a list that can be reordered, filtered, or have items inserted in the middle, which can cause state to attach to the wrong item after a change.',
      'Generating a brand-new key value on every render (such as Math.random() or Date.now()) instead of a stable identifier, which forces React to treat every item as newly created each time.',
      'Placing the key prop on a wrapper element other than the actual top-level element returned inside the map() callback.',
    ],
    keyPoints: [
      'Use array.map() to transform data arrays into arrays of JSX elements for rendering lists.',
      'Every element in a rendered list needs a unique, stable key prop among its siblings.',
      'Keys let React\'s reconciliation correctly match, update, add, or remove list items instead of guessing based on position.',
      'Prefer a stable ID from the data over the array index, especially for lists that reorder or change.',
    ],
  },

  forms: {
    title: 'Forms and Controlled Inputs',
    intro: `Forms are one of the most common places where a UI needs to track live, changing data — every keystroke, checkbox toggle, or selection needs to be reflected somewhere. React offers two approaches to working with form inputs: controlled components, where React state is the single source of truth for the input's value, and uncontrolled components, where the DOM itself holds the current value and React reads it only when needed.

Controlled inputs are the more common and more "React-idiomatic" approach, because they keep form data inside your component's state, making it easy to validate, transform, or react to changes as they happen.`,
    sections: [
      {
        heading: 'Controlled Inputs: value + onChange',
        body: `A controlled input's <code>value</code> attribute is bound to a piece of React state, and an <code>onChange</code> handler updates that state on every keystroke. Because the input's displayed value always comes from state rather than from whatever the user typed directly into the DOM, React is fully "in control" of what the field shows at any moment — hence the name.`,
      },
      {
        heading: 'Uncontrolled Inputs and refs',
        body: `An uncontrolled input has no <code>value</code> prop tying it to state; instead, the browser DOM manages the current value internally, and you read it only when you need it — typically via a <code>ref</code> — such as at form submission time. Uncontrolled inputs require less code and can be useful for simple forms or when integrating with non-React code, but they make it harder to validate or react to changes as the user types.`,
      },
      {
        heading: 'Handling Multiple Fields and Submission',
        body: `For forms with several fields, it is common to store all the field values in a single state object and update it with one shared handler that reads the input's <code>name</code> attribute to know which field changed. On submission, an <code>onSubmit</code> handler on the <code>&lt;form&gt;</code> element (paired with <code>event.preventDefault()</code>) is the standard place to validate and send the collected data.`,
        list: [
          'Controlled: value comes from state, onChange updates state — React state is the source of truth.',
          'Uncontrolled: the DOM holds the value; a ref reads it on demand, typically at submit time.',
          'A checkbox uses "checked" instead of "value" as its controlled prop, paired with onChange.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A controlled multi-field form with a single shared change handler',
        code: `import { useState } from 'react';

function SignupForm() {
  const [formData, setFormData] = useState({ username: '', agreeToTerms: false });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Submitting:', formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" />
      <label>
        <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
        I agree to the terms
      </label>
      <button type="submit" disabled={!formData.agreeToTerms}>Sign Up</button>
    </form>
  );
}

export default SignupForm;`,
        output: 'Typing into the username field updates formData.username live; checking the terms checkbox enables the "Sign Up" button (it stays disabled while unchecked); submitting logs the current { username, agreeToTerms } object to the console without reloading the page.',
      },
    ],
    commonMistakes: [
      'Setting an input\'s value prop from state but forgetting to add an onChange handler, which makes the field appear "frozen" because React keeps resetting it to the unchanged state value.',
      'Mixing controlled and uncontrolled patterns on the same input, such as providing a value prop with no onChange, which triggers a React warning about a read-only field.',
      'Reading form values directly from the DOM with document.querySelector inside React components instead of using state or refs the React way.',
      'Forgetting event.preventDefault() in the form\'s onSubmit handler, causing an unwanted page reload on submission.',
    ],
    keyPoints: [
      'Controlled inputs bind value to React state and update that state through onChange, making state the source of truth.',
      'Uncontrolled inputs let the DOM hold the value, read on demand via a ref.',
      'Checkboxes use the checked prop (not value) paired with onChange in controlled form.',
      'Always call event.preventDefault() in a form\'s onSubmit handler to stop the default page reload.',
    ],
  },

  hooks: {
    title: 'Introduction to React Hooks',
    intro: `Hooks are special functions, all starting with the word "use", that let function components tap into React features like state, side effects, and context without writing a class. Before hooks were introduced, only class components could hold state or run lifecycle logic; hooks brought that same power to plain functions, which is why modern React code is written almost entirely with function components.

Common built-in hooks include <code>useState</code> for local state, <code>useEffect</code> for side effects, <code>useContext</code> for reading context, <code>useRef</code> for mutable values that persist without causing re-renders, <code>useMemo</code> and <code>useCallback</code> for memoization, and <code>useReducer</code> for more complex state logic. React also lets you build your own custom hooks by combining these building blocks.`,
    sections: [
      {
        heading: 'The Rules of Hooks',
        body: `Hooks work reliably only if they are called in a very specific, consistent way, because React matches up hook calls between renders purely by the order in which they were called — not by name.`,
        list: [
          '<strong>Only call hooks at the top level.</strong> Never call a hook inside a loop, a conditional, or a nested function — doing so can change how many hooks run, or in what order, between renders.',
          '<strong>Only call hooks from React functions.</strong> Call them from function components or from other custom hooks, never from plain JavaScript functions or class components.',
          '<strong>Call them in the same order every render.</strong> Because React relies on call order to associate each hook with its stored state, conditionally skipping a hook call would misalign every hook that comes after it.',
        ],
      },
      {
        heading: 'Why Hooks Replaced Class Lifecycle Methods',
        body: `Class components spread related logic across separate lifecycle methods (<code>componentDidMount</code>, <code>componentDidUpdate</code>, <code>componentWillUnmount</code>), which often forced you to duplicate the same logic in multiple places. Hooks let you group related logic together in one place regardless of when it runs, and they make it far easier to extract and reuse stateful logic across components through custom hooks — something class components could not do cleanly.`,
      },
      {
        heading: 'ESLint Enforcement of Hook Rules',
        body: `Because breaking the Rules of Hooks can cause subtle, hard-to-trace bugs, most React projects install the <code>eslint-plugin-react-hooks</code> package, which statically flags hooks called conditionally, inside loops, or from non-component functions before the code ever runs.`,
      },
    ],
    examples: [
      {
        caption: 'Correct top-level hook usage versus an invalid conditional hook call',
        code: `import { useState, useEffect } from 'react';

// Correct: hooks always called at the top level, in the same order every render.
function UserStatus({ userId }) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(userId % 2 === 0); // pretend even IDs are "online" for this example
  }, [userId]);

  return <p>{isOnline ? 'Online' : 'Offline'}</p>;
}

// Incorrect (do not do this): calling useState inside a condition
// function BrokenComponent({ showExtra }) {
//   if (showExtra) {
//     const [extra, setExtra] = useState(0); // breaks the Rules of Hooks
//   }
//   return <div />;
// }

export default function App() {
  return <UserStatus userId={4} />;
}`,
        output: 'Renders "Online" because userId (4) is even, per the effect\'s logic; the commented-out BrokenComponent illustrates the invalid pattern of calling useState conditionally, which React would reject with a "Rendered more hooks than during the previous render" style error if it were actually run under changing conditions.',
      },
    ],
    commonMistakes: [
      'Calling a hook inside an if statement, loop, or nested helper function instead of at the top level of the component.',
      'Calling hooks from a regular JavaScript function or a class component instead of a function component or another custom hook.',
      'Assuming hook order does not matter because hooks are "just functions" — React actually depends entirely on consistent call order across renders.',
      'Ignoring eslint-plugin-react-hooks warnings instead of treating them as real bugs waiting to happen.',
    ],
    keyPoints: [
      'Hooks are functions starting with "use" that let function components use state, effects, context, and more.',
      'Hooks must be called only at the top level of a component or custom hook — never inside conditionals, loops, or nested functions.',
      'React matches hooks between renders by call order, so that order must stay identical on every render.',
      'Hooks replaced scattered class lifecycle methods with reusable, composable logic, including custom hooks.',
    ],
  },

  useeffect: {
    title: 'The useEffect Hook',
    intro: `<code>useEffect</code> lets a function component run side effects — code that reaches outside of pure rendering, such as fetching data, subscribing to an external event source, manually interacting with the DOM, or setting up a timer. Rendering itself should stay pure (no side effects), so useEffect gives React a designated place to run that extra code after the component has rendered.

A useEffect call takes a function to run and an optional dependency array that controls when the effect re-runs. Getting the dependency array right is one of the most important — and most commonly misunderstood — parts of working with React.`,
    sections: [
      {
        heading: 'The Dependency Array',
        body: `<code>useEffect(() => { ... }, [dep1, dep2])</code> runs the effect after the initial render and again any time one of the listed dependencies changes between renders. An empty array <code>[]</code> means the effect runs only once, right after the first render, and never again. Omitting the array entirely makes the effect run after every single render, which is rarely what you want.`,
      },
      {
        heading: 'Cleanup Functions',
        body: `If the function passed to <code>useEffect</code> returns another function, React treats that returned function as cleanup logic. React calls the cleanup function right before the effect runs again (when dependencies change) and again when the component unmounts. This is essential for anything that needs to be "undone" — clearing a timer, unsubscribing from a socket, or removing an event listener — to avoid memory leaks and duplicate subscriptions.`,
      },
      {
        heading: 'Common useEffect Use Cases',
        body: `useEffect is most often used to synchronize a component with something outside of React's rendering model.`,
        list: [
          '<strong>Data fetching</strong> — calling an API when a component mounts or when an ID prop changes, then storing the result in state.',
          '<strong>Subscriptions</strong> — attaching a listener (e.g. to a WebSocket, window resize event, or third-party library) and cleaning it up on unmount.',
          '<strong>Manual DOM interaction</strong> — focusing an input, measuring an element\'s size, or integrating with non-React DOM libraries.',
          '<strong>Timers</strong> — starting an interval or timeout, and clearing it in the cleanup function so it does not keep running after the component is gone.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Fetching data on mount and cleaning up a subscription on unmount',
        code: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchUser() {
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      if (!isCancelled) setUser(data);
    }

    fetchUser();

    return () => {
      isCancelled = true; // cleanup avoids setting state after unmount or on a stale request
    };
  }, [userId]);

  if (!user) return <p>Loading user...</p>;
  return <p>{user.name}</p>;
}

export default UserProfile;`,
        output: 'Initially renders "Loading user..."; once the fetch resolves, re-renders to show the fetched user\'s name. If userId changes before the previous fetch finishes, or the component unmounts, the cleanup function prevents the stale response from incorrectly updating state.',
      },
    ],
    commonMistakes: [
      'Omitting the dependency array entirely, causing the effect (and often a data fetch) to re-run after every single render, sometimes creating an infinite loop.',
      'Listing an incomplete dependency array — leaving out a variable the effect actually uses — which causes the effect to use stale values from an earlier render.',
      'Forgetting to return a cleanup function for subscriptions or timers, leading to memory leaks or duplicate handlers stacking up across renders.',
      'Using useEffect for calculations that could be done directly during rendering, adding an unnecessary extra render cycle.',
    ],
    keyPoints: [
      'useEffect runs side effects after rendering; its dependency array controls when it re-runs.',
      'An empty dependency array [] means "run once, after the first render only."',
      'A function returned from the effect is treated as cleanup, run before the next effect and on unmount.',
      'Typical use cases include data fetching, subscriptions, manual DOM work, and timers.',
    ],
  },

  'usememo-usecallback-concepts': {
    title: 'useMemo and useCallback: Memoization Concepts',
    intro: `<code>useMemo</code> and <code>useCallback</code> are memoization hooks: they let React skip recomputing a value or recreating a function on every render, as long as its dependencies have not changed. Both exist to address performance concerns and, importantly, referential equality issues — cases where two values are logically "the same" but JavaScript treats them as different objects because they were freshly created.

Neither hook is about correctness in the way useState or useEffect are; a component will still work without them. They are optimizations, and reaching for them everywhere "just in case" often adds complexity without a measurable benefit. They matter most when an expensive calculation is being repeated unnecessarily, or when a new function/object reference is defeating another optimization such as <code>React.memo</code>.`,
    sections: [
      {
        heading: 'useMemo: Memoizing a Computed Value',
        body: `<code>useMemo(() => computeExpensiveValue(a, b), [a, b])</code> only re-runs the computation when <code>a</code> or <code>b</code> changes; on any other re-render (triggered by unrelated state, for example), it reuses the previously computed result instead of recalculating it. This is valuable when a calculation is genuinely expensive — sorting a large array, filtering a big dataset — and the component re-renders often for unrelated reasons.`,
      },
      {
        heading: 'useCallback: Memoizing a Function Reference',
        body: `<code>useCallback(fn, [deps])</code> returns the same function reference across renders as long as the dependencies have not changed, instead of creating a brand-new function object every render. Since every function declared inside a component body is a new object each render, passing a fresh callback into a child on every render can defeat memoization on that child (such as a child wrapped in <code>React.memo</code>), because the child sees "different props" even though the callback does logically the same thing.`,
      },
      {
        heading: 'Referential Equality: Why This Matters',
        body: `JavaScript compares objects and functions by reference, not by structure — two separately created objects with identical contents are never <code>===</code> equal. React's optimizations, like <code>React.memo</code> and the dependency arrays of <code>useEffect</code>/<code>useMemo</code>/<code>useCallback</code> themselves, rely on this reference comparison to decide "did this actually change?" Without memoization, a new object or function literal created during every render will always look "changed," even when its content is identical to before.`,
        list: [
          'Use useMemo when a computation is measurably expensive and its inputs rarely change compared to how often the component re-renders.',
          'Use useCallback when passing a callback to a memoized child component, or when the function itself is a dependency of another hook.',
          'Do not reach for either hook by default — the memoization bookkeeping itself has a small cost, and premature use adds noise without benefit.',
        ],
      },
    ],
    examples: [
      {
        caption: 'useMemo avoiding a repeated expensive filter, and useCallback stabilizing a handler passed to a memoized child',
        code: `import { useState, useMemo, useCallback, memo } from 'react';

const ExpensiveList = memo(function ExpensiveList({ items, onSelect }) {
  console.log('ExpensiveList rendered');
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>{item.name}</li>
      ))}
    </ul>
  );
});

function ProductBrowser({ products, searchTerm }) {
  const [selectedId, setSelectedId] = useState(null);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      <ExpensiveList items={filteredProducts} onSelect={handleSelect} />
      {selectedId && <p>Selected product ID: {selectedId}</p>}
    </div>
  );
}

export default ProductBrowser;`,
        output: 'The expensive filtering only re-runs when products or searchTerm actually change (thanks to useMemo); because handleSelect keeps the same function reference across renders (thanks to useCallback) and ExpensiveList is wrapped in React.memo, clicking a product to update selectedId does not cause ExpensiveList to needlessly re-render or log "ExpensiveList rendered" again.',
      },
    ],
    commonMistakes: [
      'Wrapping every value and function in useMemo/useCallback "for performance" without measuring whether there is an actual performance problem to solve.',
      'Using useCallback without also wrapping the receiving child in React.memo — without that pairing, the stabilized function reference provides no benefit.',
      'Forgetting to include a value the memoized function or computation actually depends on in the dependency array, producing stale closures.',
      'Assuming useMemo guarantees the computation never re-runs — React may still discard the cached value and recompute it in certain situations, so it should not be relied on for correctness (e.g. for side effects).',
    ],
    keyPoints: [
      'useMemo memoizes a computed value; useCallback memoizes a function reference — both only recompute when their dependencies change.',
      'JavaScript compares objects and functions by reference, so a freshly created value looks "new" every render even if its contents are identical.',
      'useCallback is most useful when paired with a memoized child (e.g. React.memo) that would otherwise re-render due to a new function reference.',
      'These hooks are performance optimizations, not correctness tools — use them deliberately, not by default everywhere.',
    ],
  },

  'custom-hooks': {
    title: 'Building Custom Hooks',
    intro: `A custom hook is simply a JavaScript function, named starting with "use", that calls one or more of React's built-in hooks internally to package up reusable stateful logic. Custom hooks let you extract logic like form handling, data fetching, or toggling a boolean flag out of a component and share it across many components, without duplicating the same useState/useEffect code everywhere.

Because a custom hook is "just a function," it follows exactly the same Rules of Hooks as any built-in hook: it must be called at the top level of a component or another custom hook, and its own internal hook calls must happen in the same order every time it runs.`,
    sections: [
      {
        heading: 'Why Extract a Custom Hook',
        body: `If you notice the same combination of useState and useEffect logic appearing in multiple components — such as tracking whether a value is toggled, tracking the browser window's size, or fetching data from an endpoint — that is a strong signal to extract the shared logic into a custom hook. The component that uses the hook stays focused on rendering, while the hook owns the "how" of managing that piece of behavior.`,
      },
      {
        heading: 'A useToggle Example',
        body: `A very common, minimal custom hook is one that manages a boolean flag with convenient toggle behavior, useful for things like modals, accordions, and dropdown menus. Internally it is nothing more than a useState call wrapped in a small, reusable API.`,
      },
      {
        heading: 'A useFetch Example',
        body: `A more involved custom hook can wrap data fetching, tracking loading and error states alongside the data itself, and re-fetching whenever its input (such as a URL) changes — using useEffect and useState together and returning a clean object of values for the consuming component to read.`,
        list: [
          'Custom hooks return whatever plain values, objects, or arrays make sense for their use case — there is no single required shape.',
          'A custom hook can call other custom hooks, letting you compose small hooks into larger ones.',
          'Naming a function "useSomething" is a convention that also enables the Rules of Hooks ESLint checks to correctly recognize it as a hook.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Two custom hooks: useToggle for a boolean flag, and useFetch for data loading',
        code: `import { useState, useEffect } from 'react';

// A small reusable hook for toggling a boolean value.
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((prev) => !prev);
  return [value, toggle];
}

// A reusable hook for fetching JSON data from a URL.
function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then((json) => { if (!isCancelled) setData(json); })
      .catch((err) => { if (!isCancelled) setError(err); })
      .finally(() => { if (!isCancelled) setIsLoading(false); });

    return () => { isCancelled = true; };
  }, [url]);

  return { data, isLoading, error };
}

function ProfilePanel({ userId }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const { data: user, isLoading } = useFetch(\`/api/users/\${userId}\`);

  return (
    <div>
      <button onClick={toggleOpen}>{isOpen ? 'Hide' : 'Show'} profile</button>
      {isOpen && (isLoading ? <p>Loading...</p> : <p>{user?.name}</p>)}
    </div>
  );
}

export default ProfilePanel;`,
        output: 'The button toggles between "Show profile" and "Hide profile" on each click, using the reusable useToggle hook; when shown, it briefly displays "Loading..." and then the fetched user\'s name, all powered by the reusable useFetch hook without duplicating that fetching logic inside ProfilePanel itself.',
      },
    ],
    commonMistakes: [
      'Naming a reusable function without the "use" prefix, which prevents React and ESLint from recognizing it as a hook and enforcing the Rules of Hooks on it.',
      'Duplicating the same useState/useEffect pattern across many components instead of noticing the repetition and extracting a custom hook.',
      'Breaking the Rules of Hooks inside a custom hook itself, such as calling useState conditionally within it — a custom hook is not exempt from the same rules.',
      'Making a custom hook do too many unrelated things at once instead of keeping it focused on one specific piece of reusable logic.',
    ],
    keyPoints: [
      'A custom hook is a function starting with "use" that calls other hooks internally to package up reusable logic.',
      'Custom hooks let you share stateful logic (toggling, fetching, subscriptions) across components without duplicating code.',
      'Custom hooks must follow the same Rules of Hooks as built-in hooks, including consistent call order.',
      'Custom hooks can be composed from other custom hooks, and return whatever shape of data best fits their use case.',
    ],
  },
}
