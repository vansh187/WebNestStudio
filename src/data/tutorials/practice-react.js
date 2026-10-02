// Practice blocks for the React course. Merged onto the lesson entries in index.js by slug,
// so the lesson prose files stay unchanged.
// JSX needs a build step, so these exercises are done in a local Vite + React project
// (replace the contents of src/App.jsx unless the prompt says otherwise) and describe the
// result in words. The code avoids template literals so that it can be stored here safely.
export const practiceReact = {
  'setting-up-a-react-project': {
    whyItMatters: `React code cannot run in a browser as written: JSX has to be compiled and the modules bundled. A build tool does that, and Vite is the standard choice for new projects. Being able to create a project, start the development server and find your way around the generated files is the first step of every React job.`,
    exercise: {
      runnable: false,
      prompt: `In a terminal, with Node.js installed, write the commands to create a new React project named <code>my-app</code> with Vite, install its dependencies and start the development server. Then replace the contents of <code>src/App.jsx</code> with a component that shows a heading.

Expected result: the browser shows the heading "Hello from React" at the local address printed by the dev server, and the page updates when the file is saved.`,
      starterCode: `# TODO: create the project with Vite's react template

# TODO: go into the folder and install the dependencies

# TODO: start the development server

// src/App.jsx
// TODO: export a component that renders an h1`,
      hints: [
        'The project is created with <code>npm create vite@latest my-app -- --template react</code>.',
        'A component is a function that returns JSX, exported as the default export of the file.',
      ],
      solution: `npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

// src/App.jsx
export default function App() {
  return <h1>Hello from React</h1>;
}`,
    },
    quiz: [
      {
        question: 'Which tool is the usual choice for starting a new React project today?',
        options: ['Create React App', 'Vite', 'Grunt', 'Bower'],
        answer: 1,
        explanation: 'Create React App is no longer maintained; Vite starts faster and is actively developed.',
      },
      {
        question: 'Which command starts the development server in a Vite project?',
        options: ['npm run dev', 'npm start server', 'vite build', 'npm install'],
        answer: 0,
        explanation: 'npm run build creates the production files, and npm run preview serves them locally.',
      },
      {
        question: 'In a Vite React project, which file mounts the application into the page?',
        options: ['package.json', 'vite.config.js', 'src/App.css', 'src/main.jsx'],
        answer: 3,
        explanation: 'It calls createRoot on the element with the id root and renders the App component.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is React?',
        answer: `React is a JavaScript library for building user interfaces from components. A component is a function that returns a description of what should be on screen for the current data. When the data changes, React works out the difference and updates the DOM. It handles the view only; routing, data fetching and global state come from other libraries or from a framework such as Next.js.`,
      },
      {
        question: 'Why does a React project need a build tool?',
        answer: `Browsers do not understand JSX, so it must be compiled into JavaScript function calls. A build tool also resolves imports of packages from <code>node_modules</code>, bundles and minifies the code for production, handles CSS and images, and provides a development server that updates the page instantly when a file changes. Vite does all of this with almost no configuration.`,
      },
    ],
  },

  'jsx': {
    whyItMatters: `JSX is the syntax in which every React component is written. It looks like HTML, and the places where it differs are exactly where beginners lose time: <code>className</code> instead of <code>class</code>, braces for JavaScript, and the rule that a component returns one root element.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. The component below has four JSX mistakes: it returns two sibling elements, uses <code>class</code>, puts a JavaScript value in quotation marks, and leaves an <code>img</code> tag unclosed. Fix them.

Expected result: the page shows "Hello, Asha", a paragraph with the class intro, and an image, with no errors in the console.`,
      starterCode: `export default function App() {
  const name = "Asha";

  return (
    <h1>Hello, "name"</h1>
    <p class="intro">Welcome back.</p>
    <img src="/logo.png" alt="Logo">
  );
}`,
      hints: [
        'Wrap sibling elements in a fragment, <code>&lt;&gt;...&lt;/&gt;</code>, and write a JavaScript value inside braces: <code>{name}</code>.',
        'In JSX the attribute is <code>className</code>, and every tag must be closed: <code>&lt;img ... /&gt;</code>.',
      ],
      solution: `export default function App() {
  const name = "Asha";

  return (
    <>
      <h1>Hello, {name}</h1>
      <p className="intro">Welcome back.</p>
      <img src="/logo.png" alt="Logo" />
    </>
  );
}`,
    },
    quiz: [
      {
        question: 'How is a JavaScript expression embedded in JSX?',
        options: ['Inside double quotation marks', 'Inside parentheses', 'Inside curly braces', 'Inside angle brackets'],
        answer: 2,
        explanation: 'For example, &lt;h1&gt;{user.name}&lt;/h1&gt;.',
      },
      {
        question: 'Which attribute sets a CSS class in JSX?',
        options: ['className', 'class', 'cssClass', 'styleName'],
        answer: 0,
        explanation: 'class is a reserved word in JavaScript, so JSX uses the DOM property name.',
      },
      {
        question: 'What must a component return?',
        options: ['Exactly two elements', 'A string only', 'An array of strings', 'A single root element, which can be a fragment'],
        answer: 3,
        explanation: 'A fragment groups elements without adding a node to the DOM.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is JSX?',
        answer: `JSX is a syntax extension that lets markup be written inside JavaScript. It is not HTML and browsers cannot run it; a compiler turns each element into a function call that creates a plain JavaScript object describing the element. Because it is JavaScript, any expression can be embedded in braces, and the result can be stored in variables, passed to functions and returned from them.`,
      },
      {
        question: 'How does JSX differ from HTML?',
        answer: `Attributes use camelCase and DOM property names: <code>className</code>, <code>htmlFor</code>, <code>onClick</code>, <code>tabIndex</code>. Every tag must be closed, including <code>img</code> and <code>input</code>. The <code>style</code> attribute takes an object, not a string. JavaScript expressions go in braces. A component must return a single root element. Values rendered through braces are escaped, which protects against injected markup.`,
      },
    ],
  },

  'components': {
    whyItMatters: `A React application is a tree of components, each responsible for one piece of the screen. Splitting an interface into small, named components is what keeps a large application understandable and lets a piece such as a button or a card be reused everywhere.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Split the page below into three components: <code>Header</code>, which renders the title; <code>Footer</code>, which renders the copyright line; and <code>App</code>, which composes them around the main paragraph.

Expected result: the page looks exactly the same, but App now uses &lt;Header /&gt; and &lt;Footer /&gt;.`,
      starterCode: `export default function App() {
  return (
    <div>
      <header>
        <h1>WebNest Learn</h1>
      </header>
      <main>
        <p>Pick a course to begin.</p>
      </main>
      <footer>
        <p>Copyright WebNest Studio</p>
      </footer>
    </div>
  );
}`,
      hints: [
        'Each component is a function whose name starts with a capital letter and which returns JSX.',
        'A component is used like a tag: <code>&lt;Header /&gt;</code>.',
      ],
      solution: `function Header() {
  return (
    <header>
      <h1>WebNest Learn</h1>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <p>Copyright WebNest Studio</p>
    </footer>
  );
}

export default function App() {
  return (
    <div>
      <Header />
      <main>
        <p>Pick a course to begin.</p>
      </main>
      <Footer />
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'Why must the name of a component start with a capital letter?',
        options: ['It is only a style convention', 'JSX treats lower-case tags as HTML elements and capitalised tags as components', 'Lower-case names are reserved', 'It makes the component faster'],
        answer: 1,
        explanation: '&lt;header&gt; is the HTML element; &lt;Header&gt; is your component.',
      },
      {
        question: 'What is a function component?',
        options: ['A class that extends React.Component', 'A CSS file', 'A JavaScript function that returns JSX', 'An HTML template'],
        answer: 2,
        explanation: 'Function components with hooks are the standard way to write React today.',
      },
      {
        question: 'How does React encourage code reuse between components?',
        options: ['Composition: building components out of other components', 'Inheritance between component classes', 'Copying and pasting', 'Global variables'],
        answer: 0,
        explanation: 'A component receives other components or elements as props and children.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a function component and a class component?',
        answer: `A function component is a plain function that receives props and returns JSX, using hooks for state and side effects. A class component extends <code>React.Component</code>, keeps state in <code>this.state</code> and uses lifecycle methods such as <code>componentDidMount</code>. Function components are shorter, avoid <code>this</code>, and let logic be shared through custom hooks; they are the recommended form. Classes remain in older code and are still required for error boundaries.`,
      },
      {
        question: 'How do you decide when to split a component?',
        answer: `Split when a piece of the interface is reused elsewhere, when a component does more than one job, when it has grown too long to read comfortably, or when part of it has its own state that the rest does not need. A good component has a single responsibility and a name that describes it. Splitting too early, before any of these apply, only adds files and props to pass.`,
      },
    ],
  },

  'props': {
    whyItMatters: `Props are how data flows from a parent component down to a child. They make one component reusable with different content, and their one-way, read-only nature is what makes a React application predictable. Almost every bug report about "the child is not updating" comes down to how props are passed.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Write a <code>Card</code> component that takes a <code>title</code> prop, a <code>tone</code> prop that defaults to <code>neutral</code>, and <code>children</code>. It renders a section whose class is the tone, with the title in an h2 and the children beneath it. Use it twice in <code>App</code>.

Expected result: two cards, the first with the class neutral and the second with the class warning, each showing its own title and content.`,
      starterCode: `// TODO: function Card({ title, tone = "neutral", children })

export default function App() {
  return (
    <>
      {/* TODO: a Card titled "Welcome" containing a paragraph */}
      {/* TODO: a Card titled "Heads up" with tone "warning" containing a paragraph */}
    </>
  );
}`,
      hints: [
        'Props are read by destructuring the function parameter, and a default is written there: <code>{ title, tone = "neutral", children }</code>.',
        'Whatever is placed between the opening and closing tags of a component arrives as the <code>children</code> prop.',
      ],
      solution: `function Card({ title, tone = "neutral", children }) {
  return (
    <section className={tone}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <>
      <Card title="Welcome">
        <p>Pick a course to begin.</p>
      </Card>
      <Card title="Heads up" tone="warning">
        <p>Your session expires soon.</p>
      </Card>
    </>
  );
}`,
    },
    quiz: [
      {
        question: 'Can a component change the props it receives?',
        options: ['Yes, by assigning to them', 'Only inside useEffect', 'Only with setProps', 'No; props are read-only'],
        answer: 3,
        explanation: 'Data that changes belongs in state, owned by the component that changes it.',
      },
      {
        question: 'In which direction do props flow?',
        options: ['From parent to child', 'From child to parent', 'Between siblings', 'In both directions'],
        answer: 0,
        explanation: 'A child communicates upwards by calling a function that the parent passed down as a prop.',
      },
      {
        question: 'What is the <code>children</code> prop?',
        options: ['A list of child components\' names', 'The content placed between a component\'s opening and closing tags', 'The number of child elements', 'A reserved state variable'],
        answer: 1,
        explanation: 'It lets a component wrap arbitrary content, as a card or a layout does.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between props and state?',
        answer: `Props are passed into a component by its parent and are read-only inside it; they are the component's inputs. State is data the component owns and can change with a setter function, and changing it causes a re-render. A value that the component must modify over time is state; a value it merely receives and displays is a prop. State in a parent often becomes a prop of a child.`,
      },
      {
        question: 'What is prop drilling and how is it avoided?',
        answer: `Prop drilling is passing a prop through several layers of components that do not use it themselves, only so that a deeply nested component can receive it. It makes the intermediate components harder to change and reuse. It is avoided with composition, by passing the nested component itself as <code>children</code>; with Context for data needed widely, such as the current user or theme; or with a state management library.`,
      },
    ],
  },

  'state': {
    whyItMatters: `State is what makes a component interactive: the value of a counter, whether a menu is open, what has been typed into a field. The rule that state must be changed through its setter, and never modified directly, is the most important thing to understand about React, and the source of the most common bugs.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Build a counter: a paragraph showing the count, a button that adds one, and a button that resets it to zero. Update the count from its previous value.

Expected result: the page shows "Count: 0"; each click on Add one increases it by one, and Reset returns it to zero.`,
      starterCode: `import { useState } from "react";

export default function App() {
  // TODO: declare the count state, starting at 0

  return (
    <div>
      {/* TODO: a paragraph showing "Count: <count>" */}
      {/* TODO: a button that adds one */}
      {/* TODO: a button that resets to zero */}
    </div>
  );
}`,
      hints: [
        '<code>const [count, setCount] = useState(0)</code> gives the current value and the function that changes it.',
        'Passing a function to the setter, <code>setCount((previous) =&gt; previous + 1)</code>, updates from the latest value.',
      ],
      solution: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((previous) => previous + 1)}>Add one</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'What does <code>useState(0)</code> return?',
        options: ['The number 0', 'An object with get and set methods', 'An array holding the current value and a function to update it', 'A promise'],
        answer: 2,
        explanation: 'The two are usually unpacked with array destructuring.',
      },
      {
        question: 'Why does <code>count = count + 1</code> not update the screen?',
        options: ['The syntax is wrong', 'React re-renders only when the setter function is called', 'count is a string', 'State can only decrease'],
        answer: 1,
        explanation: 'Assigning to the variable changes nothing that React knows about.',
      },
      {
        question: 'Two <code>Counter</code> components are rendered side by side. Do they share their count?',
        options: ['No; each instance of a component has its own state', 'Yes, always', 'Only if they have the same key', 'Only in development'],
        answer: 0,
        explanation: 'To share a value, the state is moved up to their common parent.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why must state never be mutated directly?',
        answer: `React decides whether to re-render by comparing the new state with the old by reference. If an object or array in state is modified in place, the reference is unchanged, React sees no difference, and the screen does not update. State must be replaced with a new value: a new array made with spread, <code>map</code> or <code>filter</code>, or a new object made with spread. Immutable updates also make changes easy to trace.`,
      },
      {
        question: 'Is setState synchronous?',
        answer: `No. Calling the setter schedules a re-render; the state variable in the code that is currently running keeps its old value until the next render. React also batches several updates made in the same event into one render. When the new value depends on the old one, pass an updater function, such as <code>setCount((c) =&gt; c + 1)</code>, so that each update is applied to the latest value.`,
      },
    ],
  },

  'events': {
    whyItMatters: `Clicks, typing and form submissions are how users drive an application. React's event handling looks like HTML's but differs in ways that trip people up: handlers are functions passed by reference, not strings, and a handler that is called instead of passed runs on every render.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Build a small form with a text input and a submit button. When the form is submitted, stop the browser from reloading the page and show the text that was entered in a paragraph below the form.

Expected result: typing a name and pressing Enter or the button shows "Hello, " followed by the name, without the page reloading.`,
      starterCode: `import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  // TODO: function handleSubmit(event): prevent the default action and set the greeting

  return (
    <form /* TODO: attach the submit handler */>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="submit">Greet</button>
      <p>{greeting}</p>
    </form>
  );
}`,
      hints: [
        'The handler receives the event object; <code>event.preventDefault()</code> stops the page from reloading.',
        'Pass the function itself to the form: <code>onSubmit={handleSubmit}</code>, without parentheses.',
      ],
      solution: `import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setGreeting("Hello, " + name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="submit">Greet</button>
      <p>{greeting}</p>
    </form>
  );
}`,
    },
    quiz: [
      {
        question: 'What is wrong with <code>&lt;button onClick={handleClick()}&gt;</code>?',
        options: ['Nothing', 'The function is called during rendering, and its return value is used as the handler', 'onClick must be lower case', 'Buttons cannot have click handlers'],
        answer: 1,
        explanation: 'Pass the function itself: onClick={handleClick}.',
      },
      {
        question: 'How do you pass an argument to an event handler?',
        options: ['onClick={remove(id)}', 'onClick="remove(id)"', 'onClick={remove, id}', 'onClick={() => remove(id)}'],
        answer: 3,
        explanation: 'The arrow function is what gets called on the click, and it then calls remove with the argument.',
      },
      {
        question: 'How are event names written in JSX?',
        options: ['camelCase, such as onClick and onChange', 'Lower case, such as onclick', 'With a colon, such as on:click', 'In upper case'],
        answer: 0,
        explanation: 'The value is a function, not a string of code.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a synthetic event?',
        answer: `It is React's wrapper around the browser's native event. It has the same interface, with methods such as <code>preventDefault()</code> and <code>stopPropagation()</code> and properties such as <code>target</code>, and behaves the same in every browser. React attaches its listeners at the root of the application and dispatches events to the handlers itself. The underlying browser event is available as <code>event.nativeEvent</code>.`,
      },
      {
        question: 'How does a child component notify its parent that something happened?',
        answer: `The parent passes a function to the child as a prop, such as <code>onAdd</code>, and the child calls it when the event occurs, passing any data as arguments. The parent's function then updates the parent's state. Data flows down through props and events flow up through these callback props, which keeps the flow of data in one direction.`,
      },
    ],
  },

  'conditional-rendering': {
    whyItMatters: `Interfaces change with their data: a spinner while loading, an error message on failure, a different menu for a signed-in user. In React this is ordinary JavaScript inside the component, and knowing the three or four standard patterns, and the one trap with <code>&amp;&amp;</code>, covers every case.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Write a <code>Status</code> component with three props. If <code>loading</code> is true it returns a paragraph reading Loading. Otherwise it shows either "Welcome back" or "Please sign in", depending on <code>isLoggedIn</code>, and, only when <code>unread</code> is greater than zero, a line with the number of new messages.

Expected result: with loading false, isLoggedIn true and unread 3, the page shows "Welcome back" and "3 new messages"; with unread 0, the second line is absent and no stray 0 is shown.`,
      starterCode: `function Status({ loading, isLoggedIn, unread }) {
  // TODO: early return while loading

  return (
    <div>
      {/* TODO: one of two messages, depending on isLoggedIn */}
      {/* TODO: the unread line, only when unread > 0 */}
    </div>
  );
}

export default function App() {
  return <Status loading={false} isLoggedIn={true} unread={3} />;
}`,
      hints: [
        'An early <code>return</code> handles the loading case before the main JSX.',
        'Write the condition as a real boolean: <code>{unread &gt; 0 &amp;&amp; ...}</code>. <code>{unread &amp;&amp; ...}</code> would render 0.',
      ],
      solution: `function Status({ loading, isLoggedIn, unread }) {
  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <div>
      <p>{isLoggedIn ? "Welcome back" : "Please sign in"}</p>
      {unread > 0 && <p>{unread} new messages</p>}
    </div>
  );
}

export default function App() {
  return <Status loading={false} isLoggedIn={true} unread={3} />;
}`,
    },
    quiz: [
      {
        question: 'What does <code>{count &amp;&amp; &lt;p&gt;Items&lt;/p&gt;}</code> render when <code>count</code> is 0?',
        options: ['Nothing', 'The paragraph', 'The number 0', 'An error'],
        answer: 2,
        explanation: 'The expression evaluates to 0, and React renders numbers. Use count > 0 as the condition.',
      },
      {
        question: 'Which values does React render as nothing?',
        options: ['false, null and undefined', '0 and an empty string only', 'Every falsy value', 'Only null'],
        answer: 0,
        explanation: 'true is also not rendered. The number 0 is rendered.',
      },
      {
        question: 'Can an <code>if</code> statement be written directly inside JSX braces?',
        options: ['Yes', 'Only in class components', 'Only with a key', 'No; braces take expressions, so a ternary or && is used, or the if goes before the return'],
        answer: 3,
        explanation: 'An if is a statement, and JSX braces accept only expressions.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the ways to render conditionally in React?',
        answer: `An early return before the main JSX, for cases such as loading or error. The conditional operator, <code>condition ? a : b</code>, to choose between two outputs. The logical AND, <code>condition &amp;&amp; element</code>, to show something or nothing. Assigning JSX to a variable with ordinary <code>if</code> statements and rendering the variable. Returning <code>null</code> renders nothing at all.`,
      },
      {
        question: 'What is the difference between rendering nothing and hiding with CSS?',
        answer: `When a component is not rendered, it is removed from the tree: its DOM nodes are gone and its state is discarded, so it starts fresh next time. When it is hidden with CSS, such as <code>display: none</code>, it stays mounted: its state and DOM are kept and it still takes part in rendering. Removing is the default; hiding is used when state such as scroll position or form input must survive.`,
      },
    ],
  },

  'lists-keys': {
    whyItMatters: `Most screens show a list: products, messages, search results. Rendering one takes a single line of React, and the <code>key</code> that goes with it is one of the most misunderstood details. A wrong key gives bugs that look impossible, such as text typed into one row jumping to another.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Render the tasks as an unordered list, giving each item a stable key. Add a Remove button to each item that removes that task from state.

Expected result: three tasks are listed; clicking Remove beside one deletes only that task, and there is no key warning in the console.`,
      starterCode: `import { useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Learn JSX" },
    { id: 2, title: "Learn state" },
    { id: 3, title: "Build a project" },
  ]);

  // TODO: function remove(id) that keeps every task except the one with that id

  return (
    <ul>
      {/* TODO: one li per task, with a key, the title and a Remove button */}
    </ul>
  );
}`,
      hints: [
        'Use <code>tasks.map(...)</code> and put <code>key={task.id}</code> on the outermost element returned for each item.',
        'Remove with <code>setTasks(tasks.filter((task) =&gt; task.id !== id))</code>, which creates a new array.',
      ],
      solution: `import { useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Learn JSX" },
    { id: 2, title: "Learn state" },
    { id: 3, title: "Build a project" },
  ]);

  function remove(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title} <button onClick={() => remove(task.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}`,
    },
    quiz: [
      {
        question: 'What is the purpose of the <code>key</code> prop?',
        options: ['To style the item', 'To let React identify each item between renders', 'To sort the list', 'To pass data to the child'],
        answer: 1,
        explanation: 'With keys, React can tell which items were added, removed or moved.',
      },
      {
        question: 'What is the best value to use as a key?',
        options: ['A stable, unique id from the data', 'The array index', 'Math.random()', 'The current time'],
        answer: 0,
        explanation: 'A random key changes on every render, which destroys and recreates every item.',
      },
      {
        question: 'When is using the array index as a key a problem?',
        options: ['Always', 'Never', 'Only for lists of numbers', 'When items can be reordered, inserted or removed'],
        answer: 3,
        explanation: 'The index then refers to a different item, and state attached to a row moves to the wrong one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why does React need keys?',
        answer: `When a list re-renders, React has to match the new elements with the previous ones to decide what to update. Without keys it matches by position, so inserting an item at the top makes every item look changed. With a stable key on each item, React recognises the same item wherever it has moved to, keeps its DOM node and state, and makes only the necessary changes. Keys must be unique among siblings.`,
      },
      {
        question: 'Why is the index a poor key for a dynamic list?',
        answer: `An index identifies a position, not an item. If the list is sorted, filtered, or has an item inserted or removed, the same index now belongs to a different item. React then reuses the component at that position for the wrong data, so its state, such as the text in an input or a checked box, appears on the wrong row. The index is acceptable only for a static list that never changes order.`,
      },
    ],
  },

  'forms': {
    whyItMatters: `Sign-up, search, checkout and settings are all forms. In React the usual approach makes state the single source of truth for every field, which makes validation, conditional fields and submission straightforward. It is the pattern behind every form library you will use later.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Build a controlled form with two fields, <code>email</code> and <code>password</code>, kept in one state object and updated by a single change handler that uses the <code>name</code> of the input. Disable the submit button until both fields have a value.

Expected result: typing updates both fields; the Sign in button is disabled while either field is empty.`,
      starterCode: `import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });

  // TODO: function handleChange(event) that updates the field named event.target.name

  return (
    <form>
      {/* TODO: email input (name, value, onChange) */}
      {/* TODO: password input (name, value, onChange) */}
      {/* TODO: submit button, disabled unless both fields are filled */}
    </form>
  );
}`,
      hints: [
        'Copy the old object and overwrite one key: <code>setForm({ ...form, [event.target.name]: event.target.value })</code>.',
        'The button takes <code>disabled={!form.email || !form.password}</code>.',
      ],
      solution: `import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  return (
    <form>
      <input type="email" name="email" value={form.email} onChange={handleChange} />
      <input type="password" name="password" value={form.password} onChange={handleChange} />
      <button type="submit" disabled={!form.email || !form.password}>
        Sign in
      </button>
    </form>
  );
}`,
    },
    quiz: [
      {
        question: 'What is a controlled input?',
        options: ['An input that is disabled', 'An input with a maximum length', 'An input whose value comes from React state and is updated through onChange', 'An input inside a form tag'],
        answer: 2,
        explanation: 'State is the single source of truth for what the field shows.',
      },
      {
        question: 'An input has a <code>value</code> prop but no <code>onChange</code>. What happens when the user types?',
        options: ['Nothing changes; the field is effectively read-only', 'The value updates normally', 'The form submits', 'React throws an error'],
        answer: 0,
        explanation: 'React keeps forcing the field back to the value in state and logs a warning.',
      },
      {
        question: 'How is the value of an uncontrolled input read?',
        options: ['From state', 'Through a ref to the DOM element, or from the form data on submit', 'From props', 'It cannot be read'],
        answer: 1,
        explanation: 'The DOM holds the value, and React asks for it when needed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between controlled and uncontrolled components?',
        answer: `In a controlled component, the value of the field lives in React state: the input receives <code>value</code> and reports changes through <code>onChange</code>, so React always knows the current value and can validate or transform it as the user types. In an uncontrolled component, the DOM keeps the value, and the code reads it when needed through a ref or the form's data. Controlled inputs are the default; uncontrolled ones suit simple forms and file inputs.`,
      },
      {
        question: 'How do you handle a form with many fields?',
        answer: `Keep the fields in one state object and use a single change handler that reads the input's <code>name</code> and updates that key with a computed property name. Validation runs on change or on submit, with errors kept in a second object keyed by field. For large forms, a library such as React Hook Form reduces re-renders and boilerplate and integrates with schema validation.`,
      },
    ],
  },

  'hooks': {
    whyItMatters: `Hooks are how function components get state, side effects and access to React's features. They come with two rules that are not optional: React identifies each hook by the order in which it is called, so breaking the rules produces state that silently belongs to the wrong variable.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. The component below breaks the rules of hooks by calling <code>useState</code> inside a condition. Fix it so that every hook is called at the top level on every render, while keeping the behaviour: the detail text is shown only when <code>showDetails</code> is true.

Expected result: the component works with showDetails true or false, and the React hooks lint rule reports no error.`,
      starterCode: `import { useState } from "react";

function Profile({ showDetails }) {
  const [name] = useState("Asha");

  if (showDetails) {
    const [bio] = useState("Developer from Pune");
    return <p>{name}: {bio}</p>;
  }

  return <p>{name}</p>;
}

export default function App() {
  return <Profile showDetails={true} />;
}`,
      hints: [
        'Move both <code>useState</code> calls to the top of the function, before any condition.',
        'Put the condition in what is rendered, not around the hook.',
      ],
      solution: `import { useState } from "react";

function Profile({ showDetails }) {
  const [name] = useState("Asha");
  const [bio] = useState("Developer from Pune");

  if (showDetails) {
    return <p>{name}: {bio}</p>;
  }

  return <p>{name}</p>;
}

export default function App() {
  return <Profile showDetails={true} />;
}`,
    },
    quiz: [
      {
        question: 'Where may hooks be called?',
        options: ['Anywhere in a JavaScript file', 'Inside loops and conditions', 'In event handlers', 'At the top level of a function component or of a custom hook'],
        answer: 3,
        explanation: 'They must not be called inside conditions, loops or nested functions.',
      },
      {
        question: 'Why must hooks be called in the same order on every render?',
        options: ['React matches each hook call to its stored state by the order of the calls', 'It is only a style rule', 'To make the code faster', 'Because of JavaScript hoisting'],
        answer: 0,
        explanation: 'A hook skipped by a condition shifts every hook after it to the wrong state.',
      },
      {
        question: 'How are the rules of hooks usually enforced?',
        options: ['By the browser', 'By the ESLint plugin eslint-plugin-react-hooks', 'By TypeScript', 'They are not enforced'],
        answer: 1,
        explanation: 'It reports hooks called conditionally and missing effect dependencies.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the rules of hooks?',
        answer: `First, call hooks only at the top level of a component or custom hook: never inside conditions, loops, nested functions or after an early return. Second, call hooks only from React function components or from custom hooks, not from ordinary JavaScript functions. React relies on hooks being called in the same order on every render to associate each call with its state.`,
      },
      {
        question: 'Why were hooks introduced?',
        answer: `Before hooks, state and lifecycle logic required class components. Related logic was split across lifecycle methods, unrelated logic was mixed within one method, and sharing stateful logic between components needed awkward patterns such as higher-order components and render props. Hooks let function components hold state and side effects, keep related logic together, and allow it to be extracted into reusable custom hooks.`,
      },
    ],
  },

  'useeffect': {
    whyItMatters: `Rendering should be pure; fetching data, starting timers and subscribing to events are side effects, and <code>useEffect</code> is where they go. It is also the hook most often misused. A missing dependency gives stale data, a missing clean-up gives memory leaks, and an effect that updates its own dependency gives an endless loop.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Build a stopwatch: the number of seconds increases by one every second from the moment the component appears. Start the interval in an effect that runs once, and stop it when the component is removed.

Expected result: the page shows "Seconds: 0" and counts up by one each second. In development with Strict Mode, React runs the effect twice on mount, and the clean-up keeps only one interval alive.`,
      starterCode: `import { useEffect, useState } from "react";

export default function App() {
  const [seconds, setSeconds] = useState(0);

  // TODO: an effect that starts an interval adding 1 every second,
  //       runs only on mount, and clears the interval on clean-up

  return <p>Seconds: {seconds}</p>;
}`,
      hints: [
        'An empty dependency array, <code>[]</code>, makes the effect run once after the first render.',
        'Return a function from the effect that calls <code>clearInterval(id)</code>, and update with <code>setSeconds((s) =&gt; s + 1)</code>.',
      ],
      solution: `import { useEffect, useState } from "react";

export default function App() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>Seconds: {seconds}</p>;
}`,
    },
    quiz: [
      {
        question: 'When does an effect with an empty dependency array run?',
        options: ['After every render', 'Never', 'Once, after the component first mounts', 'Only when the component unmounts'],
        answer: 2,
        explanation: 'Its clean-up function runs when the component unmounts.',
      },
      {
        question: 'What happens when the dependency array is left out entirely?',
        options: ['The effect runs after every render', 'The effect runs once', 'The effect never runs', 'React throws an error'],
        answer: 0,
        explanation: 'An effect that sets state without a dependency array can therefore loop for ever.',
      },
      {
        question: 'What is the function returned from an effect used for?',
        options: ['To return data to the component', 'To clean up: clear timers, remove listeners, cancel requests', 'To re-run the effect', 'To set state'],
        answer: 1,
        explanation: 'It runs before the effect runs again and when the component unmounts.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does the dependency array of useEffect work?',
        answer: `After each render, React compares every value in the array with its value from the previous render. If any has changed, the previous clean-up runs and then the effect runs again. An empty array means the effect runs once after mounting. No array means it runs after every render. Every value from the component that the effect reads should be listed; leaving one out makes the effect use a stale value.`,
      },
      {
        question: 'Why does an effect run twice in development?',
        answer: `In Strict Mode, React deliberately mounts each component, unmounts it and mounts it again in development, running the effect, its clean-up and the effect once more. This exposes effects that do not clean up properly, such as a subscription that is never removed. It does not happen in production. The correct response is to write the clean-up, not to remove Strict Mode.`,
      },
    ],
  },

  'usememo-usecallback-concepts': {
    whyItMatters: `Every render of a component re-runs its whole function, recomputing values and creating new function objects. Usually that is fine. When a calculation is expensive, or a new function reference makes a memoised child re-render needlessly, these two hooks help. Knowing when not to use them matters just as much.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. The component filters a list of products on every render, including when only the unrelated counter changes. Wrap the filtering in <code>useMemo</code> so that it runs only when the search text or the products change, and wrap the handler passed to the memoised <code>SearchBox</code> in <code>useCallback</code>.

Expected result: clicking the counter no longer re-runs the filter or re-renders SearchBox; typing in the box does.`,
      starterCode: `import { memo, useState } from "react";

const PRODUCTS = ["pen", "pencil", "bag", "book", "bottle"];

const SearchBox = memo(function SearchBox({ onSearch }) {
  return <input onChange={(event) => onSearch(event.target.value)} placeholder="Search" />;
});

export default function App() {
  const [query, setQuery] = useState("");
  const [clicks, setClicks] = useState(0);

  // TODO: memoise this
  const visible = PRODUCTS.filter((product) => product.includes(query));

  // TODO: give this a stable identity
  const handleSearch = (text) => setQuery(text);

  return (
    <div>
      <SearchBox onSearch={handleSearch} />
      <button onClick={() => setClicks(clicks + 1)}>Clicked {clicks}</button>
      <ul>
        {visible.map((product) => (
          <li key={product}>{product}</li>
        ))}
      </ul>
    </div>
  );
}`,
      hints: [
        '<code>useMemo(() =&gt; value, [dependencies])</code> returns the cached value until a dependency changes.',
        '<code>useCallback(fn, [])</code> returns the same function object on every render; the setter from <code>useState</code> is stable and need not be listed.',
      ],
      solution: `import { memo, useCallback, useMemo, useState } from "react";

const PRODUCTS = ["pen", "pencil", "bag", "book", "bottle"];

const SearchBox = memo(function SearchBox({ onSearch }) {
  return <input onChange={(event) => onSearch(event.target.value)} placeholder="Search" />;
});

export default function App() {
  const [query, setQuery] = useState("");
  const [clicks, setClicks] = useState(0);

  const visible = useMemo(
    () => PRODUCTS.filter((product) => product.includes(query)),
    [query]
  );

  const handleSearch = useCallback((text) => setQuery(text), []);

  return (
    <div>
      <SearchBox onSearch={handleSearch} />
      <button onClick={() => setClicks(clicks + 1)}>Clicked {clicks}</button>
      <ul>
        {visible.map((product) => (
          <li key={product}>{product}</li>
        ))}
      </ul>
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'What does <code>useMemo</code> cache?',
        options: ['A function', 'A component', 'A DOM node', 'The result of a calculation'],
        answer: 3,
        explanation: 'useCallback is the one that caches the function itself.',
      },
      {
        question: 'Why can a new function created on each render cause a child wrapped in <code>memo</code> to re-render?',
        options: ['The function is a new object each time, so the prop is not equal to the previous one', 'Functions cannot be props', 'memo ignores functions', 'It cannot; functions are always equal'],
        answer: 0,
        explanation: 'memo compares props by reference, and two separately created functions are never the same reference.',
      },
      {
        question: 'Should every value and function be wrapped in these hooks?',
        options: ['Yes, always', 'No; they add overhead and complexity, and are worth it only for costly calculations or to keep references stable', 'Only in class components', 'Only in production'],
        answer: 1,
        explanation: 'Measure first; most components are fast enough without them.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between useMemo and useCallback?',
        answer: `<code>useMemo</code> runs a function and caches the value it returns, recomputing only when a dependency changes; it is for expensive calculations and for keeping an object or array reference stable. <code>useCallback</code> caches the function itself, returning the same function object between renders until a dependency changes; it is for handlers passed to memoised children or used as effect dependencies. <code>useCallback(fn, deps)</code> is equivalent to <code>useMemo(() =&gt; fn, deps)</code>.`,
      },
      {
        question: 'What is referential equality and why does it matter in React?',
        answer: `Two objects, arrays or functions are equal by reference only if they are the very same object in memory; two that merely look alike are not equal. React uses this comparison for the dependencies of hooks and for the props of memoised components. An object or function created during rendering is new on every render, so it always counts as changed, which can re-run effects and re-render children unless the reference is kept stable.`,
      },
    ],
  },

  'custom-hooks': {
    whyItMatters: `When two components need the same stateful logic, such as toggling a flag or loading data, copying it into both doubles the bugs. A custom hook packages that logic in a function that any component can call. It is the main mechanism for reuse in modern React, and most libraries expose their features as hooks.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Write a custom hook <code>useToggle</code> that takes an initial boolean and returns the current value and a function that flips it. Use it in <code>App</code> to show and hide a paragraph with a button.

Expected result: the button reads Show; clicking it reveals the paragraph and changes the label to Hide, and clicking again hides it.`,
      starterCode: `import { useState } from "react";

// TODO: function useToggle(initial = false) returning [value, toggle]

export default function App() {
  // TODO: use the hook

  return (
    <div>
      {/* TODO: a button labelled "Hide" or "Show" that toggles */}
      {/* TODO: the paragraph "Now you see me", only when open */}
    </div>
  );
}`,
      hints: [
        'A custom hook is a function whose name starts with <code>use</code> and which calls other hooks.',
        'Return the pair as an array, so the caller can name the two values as it likes.',
      ],
      solution: `import { useState } from "react";

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((current) => !current);
  return [value, toggle];
}

export default function App() {
  const [open, toggleOpen] = useToggle(false);

  return (
    <div>
      <button onClick={toggleOpen}>{open ? "Hide" : "Show"}</button>
      {open && <p>Now you see me</p>}
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'How must the name of a custom hook begin?',
        options: ['With hook', 'With a capital letter', 'With use', 'With an underscore'],
        answer: 2,
        explanation: 'The prefix lets React and the lint rules recognise it as a hook.',
      },
      {
        question: 'Two components call the same custom hook. Do they share its state?',
        options: ['No; each call has its own independent state', 'Yes, always', 'Only if they are siblings', 'Only in production'],
        answer: 0,
        explanation: 'A custom hook shares logic, not data.',
      },
      {
        question: 'What can a custom hook do that an ordinary helper function cannot?',
        options: ['Return a value', 'Take arguments', 'Run a loop', 'Call other hooks such as useState and useEffect'],
        answer: 3,
        explanation: 'That is the only real difference, and the reason for the naming rule.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a custom hook and why would you write one?',
        answer: `A custom hook is a JavaScript function whose name starts with <code>use</code> and which calls other hooks. It extracts stateful logic, such as a toggle, a form field, a data request or a subscription to window size, out of a component so that it can be reused and tested separately. Each component that calls it gets its own state. It keeps components focused on what they render.`,
      },
      {
        question: 'How do custom hooks compare with higher-order components and render props?',
        answer: `All three share logic between components. A higher-order component wraps a component in another, and render props pass a function as a child; both add layers to the component tree, which makes it deep and harder to debug, and the origin of each prop is unclear. A custom hook adds no component at all: the logic is called directly inside the component, and its inputs and outputs are explicit.`,
      },
    ],
  },

  'context': {
    whyItMatters: `Some data is needed all over an application: the signed-in user, the theme, the language. Passing it through every component in between is tedious and fragile. Context makes a value available to a whole subtree. Used for the right kind of data it removes prop drilling; used for everything it makes the application re-render too much.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Create a <code>ThemeContext</code> with the default value <code>light</code>. In <code>App</code>, provide the value <code>dark</code> to the tree. <code>Toolbar</code> sits in the middle and passes nothing down; <code>ThemedButton</code>, nested inside it, reads the theme from context and uses it as its class name.

Expected result: the button has the class dark, although Toolbar never received or passed a theme prop.`,
      starterCode: `import { createContext, useContext } from "react";

// TODO: create ThemeContext with the default "light"

function ThemedButton() {
  // TODO: read the theme from context
  return <button>Save</button>;
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

export default function App() {
  // TODO: provide the value "dark" around Toolbar
  return <Toolbar />;
}`,
      hints: [
        'Create with <code>createContext("light")</code> and read with <code>useContext(ThemeContext)</code>.',
        'Provide with <code>&lt;ThemeContext.Provider value="dark"&gt;...&lt;/ThemeContext.Provider&gt;</code>.',
      ],
      solution: `import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Save</button>;
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}`,
    },
    quiz: [
      {
        question: 'Which problem does Context solve?',
        options: ['Slow rendering', 'Passing a prop through many components that do not use it', 'Fetching data', 'Routing between pages'],
        answer: 1,
        explanation: 'This is known as prop drilling.',
      },
      {
        question: 'When the value of a context changes, which components re-render?',
        options: ['Every component that reads that context', 'Only the provider', 'Every component in the application', 'None'],
        answer: 0,
        explanation: 'This is why frequently changing data in one large context can be costly.',
      },
      {
        question: 'A component calls <code>useContext(ThemeContext)</code> but has no provider above it. What does it receive?',
        options: ['undefined, always', 'An error', 'null', 'The default value passed to createContext'],
        answer: 3,
        explanation: 'The default is used only when there is no matching provider in the tree above.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When should you use Context?',
        answer: `For data that many components at different depths need and that changes rarely: the current user, theme, locale, feature flags. It is a way of passing a value down without props, not a state manager in itself; it is normally combined with <code>useState</code> or <code>useReducer</code> in the provider. For data used by only a few nearby components, props are simpler and clearer.`,
      },
      {
        question: 'What are the performance pitfalls of Context?',
        answer: `Every component that reads a context re-renders when its value changes. Putting unrelated data in one context means a change to any part re-renders all its consumers. Creating the value object inline in the provider gives a new reference on every render, which re-renders consumers even when nothing changed; memoising the value fixes that. Splitting contexts by concern, or using a store library with selectors, avoids broad re-renders.`,
      },
    ],
  },

  'routing': {
    whyItMatters: `A React application is a single HTML page, yet users expect addresses they can bookmark, a working back button and links they can share. A router maps the URL to the component that should be shown, without reloading the page. React Router is the standard library for it.`,
    exercise: {
      runnable: false,
      prompt: `Do this in a Vite + React project after installing the router with <code>npm install react-router-dom</code>. In <code>src/App.jsx</code>, set up three routes: <code>/</code> shows a Home component, <code>/about</code> shows an About component, and <code>/users/:id</code> shows a User component that displays the id from the URL. Add navigation links to Home and About.

Expected result: clicking the links changes the URL and the content without a page reload, and visiting /users/42 shows "User 42".`,
      starterCode: `import { BrowserRouter, Link, Route, Routes, useParams } from "react-router-dom";

function Home() {
  return <h1>Home</h1>;
}

function About() {
  return <h1>About</h1>;
}

function User() {
  // TODO: read the id from the URL
  return <h1>User</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* TODO: a nav with links to "/" and "/about" */}
      {/* TODO: the three routes */}
    </BrowserRouter>
  );
}`,
      hints: [
        'A route is written <code>&lt;Route path="/about" element={&lt;About /&gt;} /&gt;</code>, inside <code>&lt;Routes&gt;</code>.',
        '<code>useParams()</code> returns an object holding the dynamic parts of the URL, such as <code>id</code>.',
      ],
      solution: `import { BrowserRouter, Link, Route, Routes, useParams } from "react-router-dom";

function Home() {
  return <h1>Home</h1>;
}

function About() {
  return <h1>About</h1>;
}

function User() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}`,
    },
    quiz: [
      {
        question: 'Why use <code>&lt;Link to="/about"&gt;</code> instead of <code>&lt;a href="/about"&gt;</code> for internal navigation?',
        options: ['Link is styled automatically', 'An a tag does not work in React', 'Link changes the URL without reloading the page, so the application keeps its state', 'Link is required by HTML'],
        answer: 2,
        explanation: 'A plain anchor makes the browser request the page again from the server.',
      },
      {
        question: 'Which hook reads a dynamic segment such as <code>:id</code> from the URL?',
        options: ['useParams', 'useState', 'useRoute', 'useLocation'],
        answer: 0,
        explanation: 'useLocation gives the whole current location, and useSearchParams reads the query string.',
      },
      {
        question: 'Which hook navigates from code, for example after a form has been submitted?',
        options: ['useHistory in every version', 'useNavigate', 'useLink', 'useRedirect'],
        answer: 1,
        explanation: 'It returns a function: navigate("/dashboard").',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is client-side routing?',
        answer: `In a traditional site, each link makes the browser request a new HTML page from the server. With client-side routing, the application loads once; clicking a link changes the URL through the browser's History API and the router renders the matching component, with no full page load. Navigation is faster and state is kept, but the server must be configured to return the application's <code>index.html</code> for every route, so that a direct visit or a refresh still works.`,
      },
      {
        question: 'How do you protect a route so that only signed-in users can see it?',
        answer: `Wrap the protected routes in a component that checks the authentication state. If the user is signed in, it renders the child route; otherwise it redirects to the login page with <code>Navigate</code>, remembering the address so that the user can be returned there afterwards. This is a convenience for the interface only: the server must still check authorisation on every API request, because client-side checks can be bypassed.`,
      },
    ],
  },

  'api-integration': {
    whyItMatters: `Almost every React application gets its data from an API, and doing that well means handling three states, not one: loading, success and failure. Skipping the loading or error state gives a blank screen when the network is slow or the server fails, which is exactly when users most need feedback.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Fetch the list of users from <code>https://jsonplaceholder.typicode.com/users</code> when the component mounts. Show "Loading" while waiting, an error message if the request fails or returns a bad status, and otherwise the users' names in a list. Cancel the request if the component is removed.

Expected result: "Loading" appears briefly, then a list of ten names. With the network turned off, an error message is shown instead.`,
      starterCode: `import { useEffect, useState } from "react";

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: fetch the users with an AbortController, check response.ok,
    //       store the result or the error, and clear the loading flag
    // TODO: return a clean-up that aborts the request
  }, []);

  // TODO: render the loading state, the error state, or the list
  return null;
}`,
      hints: [
        'Pass <code>{ signal: controller.signal }</code> to <code>fetch</code> and call <code>controller.abort()</code> in the clean-up.',
        '<code>fetch</code> does not reject on a 404 or 500, so check <code>response.ok</code> and throw. Ignore the error whose <code>name</code> is <code>AbortError</code>.',
      ],
      solution: `import { useEffect, useState } from "react";

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://jsonplaceholder.typicode.com/users", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((problem) => {
        if (problem.name === "AbortError") return;
        setError(problem.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading</p>;
  if (error) return <p>Something went wrong: {error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`,
    },
    quiz: [
      {
        question: 'Which three states should a component that loads data handle?',
        options: ['Start, middle, end', 'Loading, success and error', 'Open, closed, pending', 'Get, post, delete'],
        answer: 1,
        explanation: 'Each state needs something sensible on screen.',
      },
      {
        question: 'Why can the effect callback itself not be an <code>async</code> function?',
        options: ['An async function returns a promise, and React expects an effect to return nothing or a clean-up function', 'async is not allowed in React', 'It would run twice', 'It would block rendering'],
        answer: 0,
        explanation: 'Define an async function inside the effect and call it.',
      },
      {
        question: 'What is a race condition when fetching in an effect?',
        options: ['Two components rendering at once', 'A request that is too fast', 'A request with no headers', 'An earlier, slower response arriving after a later one and overwriting the newer data'],
        answer: 3,
        explanation: 'Aborting the previous request in the clean-up, or ignoring its result, prevents it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you fetch data in a React component?',
        answer: `In a <code>useEffect</code> that runs when the inputs of the request change: set a loading flag, make the request, check the status, store the data or the error in state, and return a clean-up that aborts the request so that an outdated response cannot update the component. In practice, most applications use a data-fetching library such as TanStack Query or SWR, or the data loading of a framework, which add caching, retries and deduplication.`,
      },
      {
        question: 'Why use a library such as TanStack Query instead of fetch in useEffect?',
        answer: `Fetching by hand means rewriting loading and error state, cancellation and race handling for every request, and it gives no caching: the same data is requested again by every component that needs it and on every visit. A query library caches responses by key, shares them between components, refetches in the background when data may be stale, retries failures and handles pagination, with far less code.`,
      },
    ],
  },

  'state-management-concepts': {
    whyItMatters: `Where state lives is the main architectural decision in a React application. Keep it too low and components cannot share it; keep everything in a global store and every change touches the whole application. Most applications need far less global state than people assume, and knowing the options avoids both mistakes.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Two sibling components need the same value: <code>TemperatureInput</code> edits a temperature in Celsius, and <code>BoilingVerdict</code> says whether water would boil at it. Lift the state up into <code>App</code>, passing the value and a change handler to the input and the value to the verdict.

Expected result: typing 100 or more shows "The water would boil"; a lower number shows "The water would not boil".`,
      starterCode: `import { useState } from "react";

function TemperatureInput({ value, onChange }) {
  // TODO: a number input showing value and reporting changes through onChange
  return null;
}

function BoilingVerdict({ celsius }) {
  // TODO: one of the two messages, depending on celsius >= 100
  return null;
}

export default function App() {
  // TODO: the shared temperature state

  return (
    <div>
      {/* TODO: TemperatureInput and BoilingVerdict, both fed from the state */}
    </div>
  );
}`,
      hints: [
        'The state lives in the closest common parent of the components that need it.',
        'The input is controlled by the parent: it receives <code>value</code> and calls <code>onChange</code> with the new number.',
      ],
      solution: `import { useState } from "react";

function TemperatureInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function BoilingVerdict({ celsius }) {
  return <p>{celsius >= 100 ? "The water would boil" : "The water would not boil"}</p>;
}

export default function App() {
  const [celsius, setCelsius] = useState(20);

  return (
    <div>
      <TemperatureInput value={celsius} onChange={setCelsius} />
      <BoilingVerdict celsius={celsius} />
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'Two sibling components need the same piece of state. Where should it live?',
        options: ['In both, kept in step with effects', 'In a global variable', 'In their closest common parent', 'In local storage'],
        answer: 2,
        explanation: 'The parent passes the value down and a function to change it. This is called lifting state up.',
      },
      {
        question: 'Which kind of data is usually best kept out of a global client store?',
        options: ['Data fetched from the server, which a data-fetching library caches better', 'The current theme', 'Whether a global modal is open', 'The signed-in user'],
        answer: 0,
        explanation: 'Server data has its own concerns: caching, staleness and refetching.',
      },
      {
        question: 'When is a state management library such as Redux or Zustand worth adding?',
        options: ['In every project from the first day', 'Never', 'Only for forms', 'When much state is shared across distant parts of a large application and props or Context have become unwieldy'],
        answer: 3,
        explanation: 'Start with local state and lift it only as far as needed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you decide where a piece of state should live?',
        answer: `Keep it as close as possible to where it is used. If only one component needs it, it is local state. If several need it, lift it to their nearest common parent. If components across the whole application need it and it changes rarely, use Context. If it is server data, keep it in a data-fetching cache. A global store is for complex client state shared widely. Values that can be computed from other state should not be state at all.`,
      },
      {
        question: 'What is the difference between Context and Redux?',
        answer: `Context is a mechanism for passing a value down the tree without props; it has no opinion about how the value is updated, and every consumer re-renders when it changes. Redux is a state management library with a single store, updates described as actions and applied by reducers, selectors that let a component subscribe to just the slice it needs, and tools for inspecting every change. Context suits simple, rarely changing data; a store suits complex, frequently changing shared state.`,
      },
    ],
  },

  'performance': {
    whyItMatters: `React is fast by default, and most performance problems come from rendering far more than necessary: a whole list re-rendering for one changed item, or an expensive component re-rendering when its props have not changed. Knowing how to find and stop those renders, and when not to bother, is what the performance questions in interviews are about.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. <code>ExpensiveList</code> logs each time it renders. At present it re-renders whenever the unrelated counter changes. Wrap it in <code>memo</code>, and make sure the props it receives keep the same identity between renders.

Expected result: the console logs "list rendered" once on load, and clicking the counter button does not log it again.`,
      starterCode: `import { useState } from "react";

function ExpensiveList({ items, onSelect }) {
  console.log("list rendered");
  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={() => onSelect(item)}>{item}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = ["pen", "bag", "book"];
  const handleSelect = (item) => setSelected(item);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList items={items} onSelect={handleSelect} />
    </div>
  );
}`,
      hints: [
        '<code>memo(Component)</code> skips a re-render when every prop is the same as last time, compared by reference.',
        'Move the constant array outside the component, and wrap the handler in <code>useCallback</code>.',
      ],
      solution: `import { memo, useCallback, useState } from "react";

const ITEMS = ["pen", "bag", "book"];

const ExpensiveList = memo(function ExpensiveList({ items, onSelect }) {
  console.log("list rendered");
  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={() => onSelect(item)}>{item}</li>
      ))}
    </ul>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback((item) => setSelected(item), []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList items={ITEMS} onSelect={handleSelect} />
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'What does <code>React.memo</code> do?',
        options: ['Caches API responses', 'Skips re-rendering a component when its props have not changed', 'Stores state permanently', 'Makes a component load lazily'],
        answer: 1,
        explanation: 'Props are compared shallowly, by reference.',
      },
      {
        question: 'By default, when a parent re-renders, what happens to its children?',
        options: ['They re-render too, whether or not their props changed', 'They never re-render', 'Only the first child re-renders', 'They are unmounted'],
        answer: 0,
        explanation: 'This is usually cheap; memo is for the cases where it is not.',
      },
      {
        question: 'What should be the first step in fixing a slow React screen?',
        options: ['Wrap every component in memo', 'Rewrite it in another framework', 'Remove all state', 'Measure with the React DevTools Profiler to find what is actually slow'],
        answer: 3,
        explanation: 'Optimising without measuring adds complexity and often misses the real cause.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you optimise the performance of a React application?',
        answer: `Measure first with the React DevTools Profiler. Then address what it shows: prevent unnecessary re-renders with <code>memo</code>, stable props through <code>useMemo</code> and <code>useCallback</code>, and state kept close to where it is used. Render long lists with virtualisation, so that only visible rows exist. Split the code and load routes lazily with <code>lazy</code> and <code>Suspense</code>. Use correct keys, and debounce expensive work triggered by typing.`,
      },
      {
        question: 'What causes a component to re-render?',
        answer: `A change to its own state; a re-render of its parent, which re-renders all children by default; and a change to a context it reads. A change in props does not by itself trigger anything: props change because the parent re-rendered. Re-rendering means the component function runs again; React then compares the result with the previous one and updates the DOM only where they differ, so a re-render does not necessarily touch the DOM.`,
      },
    ],
  },

  'error-boundaries': {
    whyItMatters: `One uncaught error during rendering makes React remove the whole component tree, leaving the user with a blank white page. An error boundary contains the damage: the broken part is replaced by a fallback and the rest of the application keeps working. Every production application should have at least one.`,
    exercise: {
      runnable: false,
      prompt: `Do this in <code>src/App.jsx</code> of a Vite + React project. Write a class component <code>ErrorBoundary</code> that shows "Something went wrong" when a component inside it throws while rendering, and logs the error. Wrap <code>Broken</code>, which always throws, in it.

Expected result: the page shows the heading and "Something went wrong" in place of the broken component, instead of going blank.`,
      starterCode: `import { Component } from "react";

// TODO: class ErrorBoundary extends Component
//       - state { hasError: false }
//       - static getDerivedStateFromError
//       - componentDidCatch that logs the error
//       - render the fallback or the children

function Broken() {
  throw new Error("This component failed");
}

export default function App() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* TODO: render Broken inside the ErrorBoundary */}
    </div>
  );
}`,
      hints: [
        '<code>static getDerivedStateFromError()</code> returns the new state, such as <code>{ hasError: true }</code>, so that the next render shows the fallback.',
        '<code>componentDidCatch(error, info)</code> is the place to log or report the error.',
      ],
      solution: `import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <p>Something went wrong</p>;
    }
    return this.props.children;
  }
}

function Broken() {
  throw new Error("This component failed");
}

export default function App() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'What kind of component must an error boundary be?',
        options: ['A function component with a hook', 'Any component', 'A class component', 'A context provider'],
        answer: 2,
        explanation: 'There is no hook equivalent of getDerivedStateFromError or componentDidCatch.',
      },
      {
        question: 'Which error does an error boundary NOT catch?',
        options: ['An error thrown inside an event handler', 'An error thrown while a child renders', 'An error in a child\'s constructor', 'An error in a child\'s lifecycle method'],
        answer: 0,
        explanation: 'Errors in event handlers and asynchronous code are handled with try and catch.',
      },
      {
        question: 'What does the user see when a rendering error is not caught by any boundary?',
        options: ['An alert', 'The whole React tree is removed, leaving a blank page', 'Only the broken component disappears', 'The previous page'],
        answer: 1,
        explanation: 'React prefers showing nothing to showing a corrupted interface.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is an error boundary?',
        answer: `An error boundary is a class component that catches JavaScript errors thrown while rendering its child tree, in their lifecycle methods and constructors, and renders a fallback interface in place of the part that failed. It implements <code>static getDerivedStateFromError</code>, to switch to the fallback, and <code>componentDidCatch</code>, to report the error. Without one, a single rendering error unmounts the entire application.`,
      },
      {
        question: 'What do error boundaries not catch, and how are those errors handled?',
        answer: `They do not catch errors in event handlers, in asynchronous code such as timers and promise callbacks, during server-side rendering, or thrown by the boundary itself. Event handlers and async functions use ordinary <code>try</code> and <code>catch</code>, storing the error in state so that it can be shown. Boundaries are usually placed at several levels: one around the whole application, and others around independent sections so that one failure does not take down the rest.`,
      },
    ],
  },

  'testing': {
    whyItMatters: `A user interface has many states, and checking them all by hand after every change does not scale. React Testing Library tests a component the way a user meets it: by what is on screen and what happens on a click. Tests written this way survive refactoring and give real confidence that the feature works.`,
    exercise: {
      runnable: false,
      prompt: `Do this in a Vite + React project with Vitest and React Testing Library installed (<code>npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom</code>, with the test environment set to jsdom). Given the Counter component in the starter, write a test file <code>src/Counter.test.jsx</code> with one test that renders the counter, checks that it shows "Count: 0", clicks the button, and checks that it now shows "Count: 1".

Expected result: running the tests reports one passing test.`,
      starterCode: `// src/Counter.jsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  );
}

// src/Counter.test.jsx
// TODO: import render, screen and fireEvent, and the Counter
// TODO: one test: render, assert "Count: 0", click the button, assert "Count: 1"`,
      hints: [
        'Find elements the way a user would: <code>screen.getByText("Count: 0")</code> and <code>screen.getByRole("button", { name: "Add one" })</code>.',
        '<code>getByText</code> throws if nothing matches, so calling it is already an assertion that the text is present.',
      ],
      solution: `// src/Counter.jsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  );
}

// src/Counter.test.jsx
import { expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Counter from "./Counter";

test("adds one when the button is clicked", () => {
  render(<Counter />);

  expect(screen.getByText("Count: 0")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Add one" }));

  expect(screen.getByText("Count: 1")).toBeTruthy();
});`,
    },
    quiz: [
      {
        question: 'What is the guiding principle of React Testing Library?',
        options: ['Test the internal state of components', 'Test every private function', 'Avoid rendering components', 'Test the component the way a user uses it: through what is rendered and how it responds'],
        answer: 3,
        explanation: 'Tests then keep passing when the implementation is refactored without changing behaviour.',
      },
      {
        question: 'Which query is generally preferred for finding an element?',
        options: ['getByRole, with the accessible name', 'getByTestId', 'querySelector with a class', 'getByClassName'],
        answer: 0,
        explanation: 'It finds elements as assistive technology does, so it also checks accessibility.',
      },
      {
        question: 'What is the difference between <code>getBy</code> and <code>queryBy</code> queries?',
        options: ['There is none', 'getBy throws when nothing matches; queryBy returns null, which is useful for asserting that something is absent', 'queryBy throws', 'getBy is asynchronous'],
        answer: 1,
        explanation: 'findBy queries return a promise and wait for the element to appear.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you test a React component?',
        answer: `Render it with React Testing Library, find elements with queries that reflect how a user perceives the page, such as <code>getByRole</code> and <code>getByLabelText</code>, simulate interaction with <code>userEvent</code> or <code>fireEvent</code>, and assert on what is then on screen. Network requests are mocked so that the test is fast and predictable. The test checks behaviour, not internal state or implementation details.`,
      },
      {
        question: 'Why avoid testing implementation details?',
        answer: `A test that inspects internal state, private functions or the exact structure of components breaks whenever the code is refactored, even when the behaviour the user sees is unchanged, which makes the tests a burden. It can also pass while the feature is actually broken for the user. Testing through the rendered output and interactions ties the test to what matters and leaves the implementation free to change.`,
      },
    ],
  },

  'deployment': {
    whyItMatters: `An application on your own machine helps nobody. Deploying means building optimised static files, configuring values that differ between environments, and making sure a refresh on any page still works. Environment variables in a front end come with one rule that is a security matter: everything in the bundle is public.`,
    exercise: {
      runnable: false,
      prompt: `Do this in a Vite + React project. Create a file named <code>.env</code> in the project root that defines the API address <code>https://api.example.com</code> in a variable the browser code is allowed to read. Read it in <code>src/App.jsx</code> and show it in a paragraph. Then write the two commands that create the production build and preview it locally.

Expected result: the page shows "API: https://api.example.com", and the build command creates a dist folder of static files.`,
      starterCode: `# .env
# TODO: the API address, in a variable exposed to the client

// src/App.jsx
export default function App() {
  // TODO: read the variable
  return <p>API: </p>;
}

# terminal
# TODO: build for production
# TODO: preview the build`,
      hints: [
        'Vite exposes only variables whose names start with <code>VITE_</code>.',
        'They are read from <code>import.meta.env</code>, for example <code>import.meta.env.VITE_API_URL</code>.',
      ],
      solution: `# .env
VITE_API_URL=https://api.example.com

// src/App.jsx
export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  return <p>API: {apiUrl}</p>;
}

# terminal
npm run build
npm run preview`,
    },
    quiz: [
      {
        question: 'What does <code>npm run build</code> produce in a Vite project?',
        options: ['A running server', 'A Docker image', 'Optimised static files in the dist folder', 'A database'],
        answer: 2,
        explanation: 'The files can be served by any static host.',
      },
      {
        question: 'Is it safe to put a secret API key in a <code>VITE_</code> variable?',
        options: ['No; the value is embedded in the JavaScript that every visitor downloads', 'Yes, it is encrypted', 'Yes, if the file is called .env', 'Only in production'],
        answer: 0,
        explanation: 'Secrets must stay on a server, which makes the call on the browser\'s behalf.',
      },
      {
        question: 'Why does refreshing <code>/about</code> on a deployed single-page application sometimes give a 404?',
        options: ['The build failed', 'The route is misspelled', 'React Router does not support refresh', 'The server looks for a file at that path; it must be configured to return index.html for all routes'],
        answer: 3,
        explanation: 'This is called a rewrite, or history fallback, rule.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you deploy a React application?',
        answer: `Run the production build, which compiles, bundles and minifies the code into static HTML, CSS and JavaScript files. Upload that folder to a static host such as Vercel, Netlify or an object store behind a CDN, usually through a pipeline that builds on every push. Configure the host to serve <code>index.html</code> for unknown paths so that client-side routes work on refresh, and set the environment variables for that environment.`,
      },
      {
        question: 'How do environment variables work in a front-end application?',
        answer: `They are read at build time and written into the bundle as plain values, so they are fixed when the application is built and are visible to anyone who downloads it. In Vite only variables prefixed with <code>VITE_</code> are exposed, through <code>import.meta.env</code>. They are suitable for public configuration, such as an API address or a public key, and never for secrets, which belong on a server.`,
      },
    ],
  },

  'typescript-in-react': {
    whyItMatters: `Most React teams now write TypeScript. Typed props mean that a component used with a missing or misspelled prop fails in the editor instead of in the browser, and they act as documentation that cannot go out of date. Job listings for React roles ask for it almost as often as for React itself.`,
    exercise: {
      runnable: false,
      prompt: `Do this in a Vite project created with the <code>react-ts</code> template, in <code>src/App.tsx</code>. Type the props of the <code>UserCard</code> component with an interface: a required string <code>name</code>, a required number <code>age</code> and an optional boolean <code>isAdmin</code>. In <code>App</code>, type the selected user's state as a string or null.

Expected result: the code compiles; leaving out name, or passing a string as age, is reported as an error in the editor.`,
      starterCode: `import { useState } from "react";

// TODO: interface UserCardProps

function UserCard({ name, age, isAdmin }) {
  return (
    <p>
      {name}, {age} {isAdmin ? "(admin)" : ""}
    </p>
  );
}

export default function App() {
  // TODO: give this state the type string | null
  const [selected, setSelected] = useState(null);

  return (
    <div onClick={() => setSelected("Asha")}>
      <UserCard name="Asha" age={30} isAdmin />
      <p>Selected: {selected}</p>
    </div>
  );
}`,
      hints: [
        'An optional property is marked with a question mark: <code>isAdmin?: boolean</code>.',
        'The type of the state is given as a generic: <code>useState&lt;string | null&gt;(null)</code>.',
      ],
      solution: `import { useState } from "react";

interface UserCardProps {
  name: string;
  age: number;
  isAdmin?: boolean;
}

function UserCard({ name, age, isAdmin }: UserCardProps) {
  return (
    <p>
      {name}, {age} {isAdmin ? "(admin)" : ""}
    </p>
  );
}

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div onClick={() => setSelected("Asha")}>
      <UserCard name="Asha" age={30} isAdmin />
      <p>Selected: {selected}</p>
    </div>
  );
}`,
    },
    quiz: [
      {
        question: 'Which file extension is used for a TypeScript file that contains JSX?',
        options: ['.ts', '.tsx', '.jsx', '.d.ts'],
        answer: 1,
        explanation: 'A plain .ts file cannot contain JSX.',
      },
      {
        question: 'How is an optional prop declared in an interface?',
        options: ['title?: string', 'optional title: string', 'title: string?', 'title = string'],
        answer: 0,
        explanation: 'Inside the component its type is then string or undefined.',
      },
      {
        question: 'When must the type be given explicitly to <code>useState</code>?',
        options: ['Always', 'Never', 'Only for numbers', 'When the initial value does not show the full type, such as null or an empty array'],
        answer: 3,
        explanation: 'From useState(0), TypeScript infers number without help.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the benefits of TypeScript in a React project?',
        answer: `Props are checked where a component is used, so a missing, misspelled or wrongly typed prop is an error in the editor and in the build, not a bug at runtime. State, event handlers and API responses are typed, which catches <code>undefined</code> access and mistaken assumptions about data. Editors offer accurate autocompletion, and renaming or restructuring is safe because the compiler finds every affected place.`,
      },
      {
        question: 'How do you type an event handler in React?',
        answer: `React provides generic event types parameterised by the element. A change handler on an input takes <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>, a form submit handler takes <code>React.FormEvent&lt;HTMLFormElement&gt;</code>, and a button click takes <code>React.MouseEvent&lt;HTMLButtonElement&gt;</code>. When the handler is written inline in the JSX, TypeScript infers the type and no annotation is needed.`,
      },
    ],
  },
}
