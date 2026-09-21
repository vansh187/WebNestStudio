// React Tutorial Module B — hand-written lesson content.
// Keys are fixed topic slugs used by the site's routing/navigation.
export const reactContentB = {
  context: {
    title: 'React Context API',
    intro: `As a React application grows, passing data through several layers of components using props becomes tedious and fragile. If a top-level component needs to share a value — a logged-in user, a theme, a language preference — with a deeply nested component, every intermediate component has to accept and forward that prop even if it never uses it itself. This pattern is known as "prop drilling," and the Context API exists specifically to solve it.

Context lets you create a value at one point in the component tree and read it directly from any descendant, no matter how deeply nested, without passing it through every level in between. It is built into React itself, so no extra library is required for simple shared state.`,
    sections: [
      {
        heading: 'Creating and Providing Context',
        body: `Context is created with <code>createContext()</code>, which returns an object containing a Provider and a Consumer. In modern function-component code you almost always use the Provider component together with the <code>useContext</code> hook, and skip the Consumer render-prop pattern entirely. The Provider accepts a <code>value</code> prop, and every descendant component wrapped inside it can read that value.`,
        list: [
          '<code>const ThemeContext = createContext(defaultValue);</code> — creates the context object.',
          '<code>&lt;ThemeContext.Provider value={theme}&gt;</code> — makes "theme" available to all descendants.',
          '<code>const theme = useContext(ThemeContext);</code> — reads the nearest matching Provider\'s value from any descendant.',
        ],
      },
      {
        heading: 'Avoiding Prop Drilling',
        body: `Without context, a value needed five levels deep must be passed as a prop through all four intermediate components, even though only the top and bottom components actually care about it. Context removes that obligation: only the component that owns the data renders a Provider, and only the component that needs the data calls <code>useContext</code>. This keeps intermediate components simpler and easier to reuse, because they no longer need to know about data they don't use.`,
      },
      {
        heading: 'When Context Causes Unnecessary Re-renders',
        body: `Every component that calls <code>useContext(SomeContext)</code> re-renders whenever the Provider's <code>value</code> prop changes, regardless of which part of that value the component actually uses. A common mistake is passing a brand-new object literal as the value on every render of the parent (e.g. <code>value={{ user, setUser }}</code>), which creates a new reference every time and forces every consumer to re-render even if the relevant data hasn't changed. This is fixed by memoizing the value with <code>useMemo</code>, and by splitting large, frequently-changing state into smaller, more focused contexts instead of one giant "app context."`,
        list: [
          'Wrap the value object in <code>useMemo(() => ({ user, setUser }), [user])</code> so it only changes reference when "user" actually changes.',
          'Split contexts by concern (e.g. ThemeContext, AuthContext) instead of one big context, so unrelated updates don\'t trigger unrelated re-renders.',
          'For very frequent updates (like mouse position or animation frames), context is usually the wrong tool — consider local state or a dedicated state library instead.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A ThemeContext shared across a component tree without prop drilling',
        code: `import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Memoize so consumers don't re-render on every ThemeProvider render
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme} (click to toggle)
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Context API Demo</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}`,
        output: 'Renders a heading and a button reading "Current theme: light (click to toggle)". Clicking the button flips the theme to "dark" and back, with ThemedButton reading the value directly from context — no props were passed through App.',
      },
    ],
    commonMistakes: [
      'Passing a new object or array literal directly as the Provider\'s "value" prop on every render, causing every consumer to re-render unnecessarily — fix with useMemo.',
      'Calling useContext outside of any matching Provider and being surprised the value is the default (or null), not an error.',
      'Using one giant context for all global state, which causes unrelated components to re-render whenever any piece of that state changes.',
      'Reaching for context to solve every prop-passing situation, even when the data is only needed one or two levels down and a simple prop would be clearer.',
    ],
    keyPoints: [
      'createContext + Provider + useContext lets any descendant read shared data without passing it through every intermediate component.',
      'Context is ideal for rarely-changing, broadly-needed data like theme, authenticated user, or locale.',
      'Every consumer re-renders when the Provider value reference changes — memoize the value and split contexts by concern to limit that.',
      'Context is not a full state-management replacement; frequently changing or highly localized state is often better handled elsewhere.',
    ],
  },

  routing: {
    title: 'Client-Side Routing with React Router',
    intro: `Single-page React applications render everything from JavaScript, so the browser's native URL-based navigation doesn't automatically map to different "pages." React Router (the <code>react-router-dom</code> package) solves this by letting you define routes that map URL paths to components, all rendered client-side without a full page reload.

React Router v6+ centers on a small set of components and hooks: <code>BrowserRouter</code> to enable routing, <code>Routes</code> and <code>Route</code> to declare which component renders for which path, <code>Link</code> and <code>NavLink</code> for navigation, and hooks like <code>useParams</code> and <code>useNavigate</code> to read route data and navigate programmatically.`,
    sections: [
      {
        heading: 'Setting Up Routes',
        body: `The whole app is wrapped in a <code>&lt;BrowserRouter&gt;</code>, which uses the HTML5 history API to keep the UI in sync with the URL. Inside it, a <code>&lt;Routes&gt;</code> element contains one <code>&lt;Route&gt;</code> per path, each pairing a <code>path</code> with an <code>element</code> to render. Only the first matching route renders its element, and a path of <code>"*"</code> is commonly used as a catch-all "not found" route.`,
      },
      {
        heading: 'Navigating Between Routes',
        body: `Use <code>&lt;Link to="/about"&gt;</code> instead of a plain <code>&lt;a href="/about"&gt;</code> for in-app navigation — Link intercepts the click and updates the URL without a full page reload, preserving application state. <code>NavLink</code> behaves the same way but also applies an "active" styling class automatically when its path matches the current URL, which is useful for navigation menus.`,
      },
      {
        heading: 'Reading URL Parameters and Navigating Programmatically',
        body: `Dynamic segments in a path, like <code>/users/:id</code>, are read inside the matching component with the <code>useParams()</code> hook, which returns an object such as <code>{ id: "42" }</code>. For navigation that must happen in response to logic rather than a direct click — after a form submits successfully, for example — the <code>useNavigate()</code> hook returns a function you call with a path, such as <code>navigate("/dashboard")</code> or <code>navigate(-1)</code> to go back.`,
        list: [
          '<code>useParams()</code> — reads dynamic segments like <code>:id</code> from the current URL.',
          '<code>useNavigate()</code> — returns a function to navigate imperatively, e.g. after an async action completes.',
          '<code>useLocation()</code> — gives access to the current URL, search params, and any navigation state.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A small app with static routes, a dynamic route, and programmatic navigation',
        code: `import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function Home() {
  return <h1>Welcome Home</h1>;
}

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>User Profile #{id}</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

function NotFound() {
  return <h1>404 — Page Not Found</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | <Link to="/users/42">User 42</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`,
        output: 'A nav bar with two links is always visible. Clicking "User 42" changes the URL to /users/42 and renders "User Profile #42" with a "Back to Home" button; clicking that button calls navigate("/") and returns to the Home view — all without a full page reload.',
      },
    ],
    commonMistakes: [
      'Using a plain <a> tag for internal navigation, which causes a full page reload and loses all in-memory React state.',
      'Forgetting that route matching order and specificity matter — placing a catch-all "*" route before more specific routes can shadow them.',
      'Reading useParams() outside of a component actually rendered by a matching Route, where the params will be undefined.',
      'Calling useNavigate() at the top level of a module instead of inside a component or hook, where hooks are not valid.',
    ],
    keyPoints: [
      'BrowserRouter, Routes, and Route wire URL paths to components without full page reloads.',
      'Link and NavLink handle in-app navigation; NavLink also supports "active" styling.',
      'useParams() reads dynamic URL segments; useNavigate() navigates programmatically from event handlers or effects.',
      'A "*" catch-all Route provides a not-found page, and should generally be listed last.',
    ],
  },

  'api-integration': {
    title: 'Fetching Data and API Integration in React',
    intro: `Most real applications need to load data from a server rather than hardcoding it. In a function component, this is done inside a <code>useEffect</code> hook, since fetching data is a side effect that shouldn't happen during rendering itself. The two most common tools for making the request are the browser's built-in <code>fetch</code> API and the popular third-party library <code>axios</code>.

Beyond just calling an API, a properly integrated data-fetching component also needs to manage three distinct states: loading (the request is in flight), success (data arrived), and error (the request failed) — and render appropriate UI for each.`,
    sections: [
      {
        heading: 'Fetching Data with useEffect',
        body: `The fetch call is placed inside a <code>useEffect</code> with an appropriate dependency array — an empty array (<code>[]</code>) means "run once, after the first render," while including a value like <code>userId</code> means "re-run whenever userId changes." Inside the effect, you typically set a loading flag to true, perform the request, then update state with the result or the error, and finally set loading back to false.`,
      },
      {
        heading: 'Managing Loading and Error State',
        body: `A robust data-fetching component keeps at least three pieces of state: the data itself (initially null or an empty value), a loading boolean (initially true), and an error value (initially null). The component's JSX then branches on these: show a spinner or "Loading..." message while loading is true, show an error message if error is set, and otherwise render the data.`,
        list: [
          '<code>const [data, setData] = useState(null);</code>',
          '<code>const [loading, setLoading] = useState(true);</code>',
          '<code>const [error, setError] = useState(null);</code>',
        ],
      },
      {
        heading: 'Cleanup and Avoiding Race Conditions',
        body: `If a component can unmount or its dependencies can change before a request finishes, setting state after that point can trigger warnings or bugs. The standard fix is to track whether the effect is still "current" — either with an AbortController (works with fetch) to cancel the in-flight request, or a boolean flag checked before calling setState in the effect's cleanup function.`,
      },
    ],
    examples: [
      {
        caption: 'Fetching a user list with loading and error states, using fetch',
        code: `import { useEffect, useState } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(\`Request failed with status \${response.status}\`);
        }
        const json = await response.json();
        setUsers(json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
    return () => controller.abort(); // cancel if the component unmounts first
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UserList;`,
        output: 'Initially renders "Loading users...". Once the fetch resolves, it renders a bulleted list of user names from the API; if the request fails (network error or non-2xx status), it renders "Error: <message>" instead of the list.',
      },
      {
        caption: 'The same request using axios, which parses JSON automatically',
        code: `import { useEffect, useState } from 'react';
import axios from 'axios';

function PostDetails({ postId }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(\`https://jsonplaceholder.typicode.com/posts/\${postId}\`)
      .then((response) => {
        if (isMounted) setPost(response.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });
    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (error) return <p>Error: {error}</p>;
  if (!post) return <p>Loading post...</p>;

  return <h2>{post.title}</h2>;
}

export default PostDetails;`,
        output: 'Shows "Loading post..." then replaces it with the post title once axios resolves. If postId changes, the effect re-runs and fetches the new post; the isMounted flag prevents a state update if the component unmounted first.',
      },
    ],
    commonMistakes: [
      'Calling fetch directly inside the component body instead of inside useEffect, which causes an infinite loop of requests on every render.',
      'Forgetting to check response.ok with fetch — unlike axios, fetch does not reject the promise on a 404 or 500 status.',
      'Omitting the effect\'s cleanup/cancellation, causing "state update on an unmounted component" warnings or stale data overwriting newer data.',
      'Leaving the dependency array empty when the fetch actually depends on a prop or state value like an id, so the data never refreshes when it should.',
    ],
    keyPoints: [
      'Data fetching belongs inside useEffect, not directly in the render body, because it is a side effect.',
      'Track loading, data, and error as separate state values and render UI conditionally based on them.',
      'fetch resolves even on HTTP error responses (check response.ok); axios rejects the promise automatically and parses JSON for you.',
      'Cancel or ignore stale requests on cleanup to avoid race conditions and updates after unmount.',
    ],
  },

  'state-management-concepts': {
    title: 'State Management Concepts in React',
    intro: `Not all state needs the same treatment. React applications typically deal with three different scopes of state: state that belongs to a single component, state that must be shared between a few related components, and state that many unrelated parts of the app need. Choosing the right tool for each scope keeps an application simple instead of over-engineered.

The general progression is: start with local <code>useState</code>, lift it up when siblings need to share it, and only reach for an external state library once prop drilling or context re-render costs become a real problem — not by default.`,
    sections: [
      {
        heading: 'When Local useState Is Enough',
        body: `If a piece of state is only read and updated by one component (and maybe its direct children via props), local <code>useState</code> or <code>useReducer</code> is the right and simplest choice. Examples include whether a dropdown is open, the current value of a text input, or a toggle for showing/hiding a section. Reaching for global state here adds indirection and complexity with no real benefit.`,
      },
      {
        heading: 'Lifting State Up',
        body: `When two or more sibling components need to reflect or modify the same piece of state, the standard React pattern is "lifting state up": move the state to their nearest common parent, and pass the value down as props along with a setter function (or callback) to update it. This keeps the data flow explicit and predictable — data always flows down through props, and changes flow up through callback functions — without introducing context or an external library.`,
      },
      {
        heading: 'External State Libraries (Redux, Zustand, and Similar)',
        body: `When state needs to be read and updated from many unrelated components scattered across the tree, and Context's re-render costs or boilerplate become a burden, an external state management library becomes worth considering. <strong>Redux</strong> centralizes state in a single store, updated only through dispatched actions and pure reducer functions, which gives strong predictability and excellent debugging tools but comes with more setup and ceremony. <strong>Zustand</strong> takes a lighter approach: state lives in a small store created with a hook-like function, requires far less boilerplate, and components subscribe only to the specific slices of state they use, which avoids the "everything re-renders" problem that plain Context can have.`,
        list: [
          '<strong>Local useState</strong> — single component owns and uses the state.',
          '<strong>Lifted state / Context</strong> — a handful of related components, or broadly-needed but rarely-changing data (theme, auth).',
          '<strong>Redux / Zustand</strong> — large apps with complex, frequently-updated state shared across many unrelated components.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Lifting state up so two sibling components share one source of truth',
        code: `import { useState } from 'react';

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}:{' '}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TemperatureSummary({ celsius }) {
  const fahrenheit = (celsius * 9) / 5 + 32;
  return <p>{celsius}°C is {fahrenheit}°F</p>;
}

export default function TemperatureConverter() {
  // State lives in the common parent, not in either child
  const [celsius, setCelsius] = useState(20);

  return (
    <div>
      <TemperatureInput label="Celsius" value={celsius} onChange={setCelsius} />
      <TemperatureSummary celsius={celsius} />
    </div>
  );
}`,
        output: 'Renders a number input pre-filled with 20 and a paragraph reading "20°C is 68°F". Typing a new value in the input immediately updates the summary paragraph, because both components read from the same lifted state.',
      },
      {
        caption: 'A minimal Zustand store, for comparison with Context/Redux',
        code: `// store.js
import { create } from 'zustand';

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// Counter.jsx
import { useCounterStore } from './store';

function Counter() {
  // Only re-renders when "count" changes, not on unrelated store updates
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>Count: {count}</button>;
}

export default Counter;`,
        output: 'Renders a button showing "Count: 0". Each click increments the shared store value; any other component in the app that also calls useCounterStore((state) => state.count) updates in sync, without prop drilling or a Context Provider.',
      },
    ],
    commonMistakes: [
      'Reaching for Redux or another external library for state that is only ever used inside one component.',
      'Lifting state all the way to the top-level App component when it is only shared between two nearby siblings, making prop chains longer than necessary.',
      'Storing derived values (like a computed total) as separate state instead of calculating them during render from existing state, leading to state that can go out of sync.',
      'Using Context for state that changes very frequently across a wide tree, then being surprised by widespread re-renders that a library like Zustand would have avoided via selective subscriptions.',
    ],
    keyPoints: [
      'Start with local useState; it is sufficient for state a single component owns.',
      'Lift state to the nearest common parent when sibling components need to share it.',
      'Context suits broadly-needed, infrequently-changing data; it is not a full state-management solution.',
      'Redux and Zustand solve large-scale shared state, with Redux favoring strict predictability and Zustand favoring minimal boilerplate and selective re-renders.',
    ],
  },

  performance: {
    title: 'Optimizing React Performance',
    intro: `React re-renders a component whenever its state changes, its parent re-renders, or the context it consumes changes. Most of the time this is fast enough to be invisible, but as component trees grow and lists get longer, unnecessary re-renders can start to cause visible lag. React provides specific tools to avoid renders that don't actually need to happen.

Performance work in React is mostly about doing less work, not doing the same work faster: skipping re-renders of components whose output wouldn't change, and giving React the information it needs to update lists efficiently.`,
    sections: [
      {
        heading: 'React.memo — Skipping Re-renders for Unchanged Props',
        body: `By default, when a parent component re-renders, every child re-renders too, even if that child's props haven't changed. Wrapping a component in <code>React.memo()</code> makes React perform a shallow comparison of its props before re-rendering; if none of the props changed (by reference for objects/functions, by value for primitives), React skips re-rendering that component and reuses its last output. This is most valuable for components that are expensive to render or that re-render very often with the same props.`,
      },
      {
        heading: 'Stabilizing Props with useCallback and useMemo',
        body: `React.memo only helps if the props passed to the memoized component actually stay the same reference between renders. Passing an inline function (<code>onClick={() => doSomething()}</code>) creates a brand-new function on every render, defeating memo. <code>useCallback</code> memoizes a function reference across renders (re-creating it only when its dependencies change), and <code>useMemo</code> memoizes a computed value the same way — both are the usual partners to React.memo.`,
      },
      {
        heading: 'Correct Keys for List Rendering',
        body: `When rendering a list with <code>.map()</code>, React uses the <code>key</code> prop to match array items across renders, so it can update, reorder, add, or remove the corresponding DOM nodes efficiently instead of re-rendering the whole list. Keys must be stable and unique among siblings — a database id is ideal. Using the array index as a key works only if the list never reorders, is never filtered, and items are never inserted/removed from the middle; otherwise it can cause React to reuse the wrong DOM node and component state for the wrong item.`,
        list: [
          'Use a stable unique id from your data (e.g. <code>item.id</code>) as the key, not the array index, whenever the list can reorder or change.',
          'Never use Math.random() or a newly generated value as a key — that defeats the purpose of keys entirely, since it changes every render.',
          'Keys only need to be unique among sibling elements in that one list, not globally unique across the whole app.',
        ],
      },
    ],
    examples: [
      {
        caption: 'React.memo combined with useCallback to prevent unnecessary child re-renders',
        code: `import { useState, useCallback, memo } from 'react';

const ExpensiveListItem = memo(function ExpensiveListItem({ item, onSelect }) {
  console.log('Rendering item:', item.id);
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

export default function ItemList() {
  const [items] = useState([
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
  ]);
  const [counter, setCounter] = useState(0);

  // Stable function reference across renders — required for memo to help
  const handleSelect = useCallback((id) => {
    console.log('Selected item', id);
  }, []);

  return (
    <div>
      <button onClick={() => setCounter((c) => c + 1)}>
        Unrelated re-render trigger: {counter}
      </button>
      <ul>
        {items.map((item) => (
          <ExpensiveListItem key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </ul>
    </div>
  );
}`,
        output: 'Clicking "Unrelated re-render trigger" increments the counter and re-renders ItemList, but because "items" never changes and handleSelect is memoized with useCallback, the memoized ExpensiveListItem components do not re-render — no new "Rendering item" console logs appear after the first render.',
      },
    ],
    commonMistakes: [
      'Wrapping every component in React.memo "just in case," which adds a comparison cost without a real re-render problem to solve.',
      'Using React.memo on a component but still passing it a new inline object, array, or function prop each render, which defeats the memoization entirely.',
      'Using the array index as the list key for a list that can be reordered, filtered, or have items inserted/removed, causing subtle state and UI bugs.',
      'Reaching for useMemo/useCallback for trivial, cheap computations where the memoization overhead outweighs the benefit.',
    ],
    keyPoints: [
      'React.memo skips re-rendering a component when its props are shallowly equal to the previous render.',
      'useCallback and useMemo keep function and value references stable so memoized children actually benefit.',
      'List keys should be stable, unique identifiers from the data, not array indexes, whenever the list can change order or membership.',
      'Optimize based on measured, real re-render problems — premature memoization adds complexity without guaranteed benefit.',
    ],
  },

  'error-boundaries': {
    title: 'Error Boundaries in React',
    intro: `A JavaScript error thrown while rendering, in a lifecycle method, or in a constructor anywhere in a component tree will, by default, unmount the entire tree above it — leading to a blank screen for the whole app just because one small component failed. Error boundaries are React's mechanism for catching those rendering errors in a part of the tree and showing a fallback UI instead of crashing everything.

Error boundaries are one of the few remaining pieces of modern React that must be written as a class component, because React does not yet provide hook equivalents for the two lifecycle methods they require: <code>static getDerivedStateFromError()</code> and <code>componentDidCatch()</code>. Function components can be wrapped by an error boundary, but they cannot currently serve as one themselves.`,
    sections: [
      {
        heading: 'Why Hooks Cannot Replace Error Boundaries (Yet)',
        body: `Error boundaries rely on <code>getDerivedStateFromError</code>, a static class method called during the "render" phase to compute fallback state, and <code>componentDidCatch</code>, an instance method called during the "commit" phase for side effects like logging. React has not introduced hook equivalents for either, so as of the current stable React releases, error boundaries must be class components. This is a deliberate and well-known exception to the "hooks-only" style used everywhere else in modern React code.`,
      },
      {
        heading: 'What Error Boundaries Catch (and What They Don\'t)',
        body: `Error boundaries catch errors thrown during rendering, in lifecycle methods, and in constructors of the components below them in the tree. They do <strong>not</strong> catch errors inside event handlers (use a normal try/catch there), errors in asynchronous code such as <code>setTimeout</code> or promise callbacks, errors during server-side rendering, or errors thrown in the error boundary's own code.`,
        list: [
          'Caught: errors thrown while rendering a child component, or in a child\'s lifecycle/constructor.',
          'Not caught: errors inside onClick and other event handlers — wrap those in a regular try/catch instead.',
          'Not caught: errors in async code (fetch callbacks, setTimeout, promises) unless they end up being thrown during a subsequent render.',
        ],
      },
      {
        heading: 'Why This Matters in Production',
        body: `Without an error boundary, one unexpected null value, malformed API response, or third-party bug in a small widget can blank out an entire page for every user, with no way to recover except a manual refresh. Placing error boundaries strategically — around a page-level layout, around each major widget, or around a specific risky feature — contains the damage: the rest of the application keeps working, the user sees a friendly fallback message instead of a blank screen, and the boundary's componentDidCatch is a natural place to report the error to a monitoring service.`,
      },
    ],
    examples: [
      {
        caption: 'A reusable class-based ErrorBoundary wrapping a function component that might throw',
        code: `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Side effect: log the error to a monitoring service
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong with this section.</h2>;
    }
    return this.props.children;
  }
}

function BuggyProfile({ user }) {
  // Throws if "user" is null — a realistic bug from a bad API response
  return <p>Welcome, {user.name.toUpperCase()}</p>;
}

export default function App() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ErrorBoundary>
        <BuggyProfile user={null} />
      </ErrorBoundary>
      <p>This footer still renders normally.</p>
    </div>
  );
}`,
        output: 'Renders "Dashboard", then "Something went wrong with this section." in place of the crashing BuggyProfile component, and still renders the footer paragraph normally — the error is contained instead of blanking the whole page.',
      },
    ],
    commonMistakes: [
      'Trying to write an error boundary as a function component with hooks — React currently has no hook equivalent for getDerivedStateFromError/componentDidCatch.',
      'Expecting an error boundary to catch errors thrown inside an onClick or other event handler — those need a manual try/catch.',
      'Wrapping the entire application in a single top-level error boundary only, so any error still blanks the whole UI instead of just the failing section.',
      'Forgetting to reset the boundary\'s state (e.g. via a "try again" button or a key change) so users get stuck on the fallback UI permanently after a transient error.',
    ],
    keyPoints: [
      'Error boundaries catch rendering, lifecycle, and constructor errors in their child tree and show a fallback UI instead of crashing the app.',
      'They must be class components today, because getDerivedStateFromError and componentDidCatch have no hook equivalent yet.',
      'They do not catch errors in event handlers or asynchronous callbacks — those still need try/catch.',
      'Placing multiple, narrowly-scoped error boundaries around independent sections limits the blast radius of any single failure.',
    ],
  },

  testing: {
    title: 'Testing React Components with React Testing Library',
    intro: `Automated tests give confidence that a component behaves correctly and keeps behaving correctly as the code changes. React Testing Library (RTL) is the standard tool for testing React components, and it is built around a specific philosophy: tests should interact with components the way a real user would — finding elements by visible text, labels, or roles, and clicking or typing — rather than reaching into component internals like state or instance methods.

RTL is typically paired with a test runner such as Jest or Vitest, which provides <code>describe</code>, <code>it</code>/<code>test</code>, and assertion functions, while RTL itself provides the rendering and querying utilities.`,
    sections: [
      {
        heading: 'render and screen',
        body: `<code>render(&lt;Component /&gt;)</code> mounts a component into a virtual DOM for testing. After rendering, you query the result using the <code>screen</code> object, which exposes methods like <code>getByText</code>, <code>getByRole</code>, and <code>getByLabelText</code> to find elements the same way a user would identify them visually — by their text or accessible role — rather than by CSS class names or internal implementation details.`,
      },
      {
        heading: 'Simulating User Interaction with fireEvent',
        body: `<code>fireEvent</code> dispatches DOM events such as clicks, changes, and form submissions on elements found via <code>screen</code>. A typical pattern is: render the component, find an element, fire an event on it (like a click), then assert that the UI updated as expected using <code>expect(...)</code> matchers such as <code>toBeInTheDocument()</code> or <code>toHaveTextContent()</code>. The newer <code>userEvent</code> library models real user interaction even more closely (including focus and keyboard events) and is often preferred over fireEvent for new tests, but fireEvent remains the foundational, directly-included tool.`,
      },
      {
        heading: 'Testing Philosophy: Behavior, Not Implementation',
        body: `RTL deliberately makes it awkward to test internal state or call component methods directly, because doing so couples tests to implementation details that can change without changing user-visible behavior. A well-written RTL test would rather assert "the text 'Item added' appears after clicking Add" than "the internal itemCount state equals 1" — the former still passes after a refactor that changes how state is stored internally, as long as the visible behavior is unchanged.`,
      },
    ],
    examples: [
      {
        caption: 'Testing a counter component: rendering, clicking, and asserting on the result',
        code: `// Counter.jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

// Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Counter from './Counter';

test('increments the count when the button is clicked', () => {
  render(<Counter />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});`,
        output: 'Running the test suite (e.g. "npm test") reports this test as passing: the component initially shows "Count: 0", and after simulating a click on the Increment button, the text "Count: 1" is found in the rendered output.',
      },
      {
        caption: 'Testing a simple login form, including an accessible label query',
        code: `// LoginForm.jsx
import { useState } from 'react';

export default function LoginForm({ onSubmit }) {
  const [username, setUsername] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}
    >
      <label htmlFor="username">Username</label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit">Log In</button>
    </form>
  );
}

// LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

test('calls onSubmit with the typed username', () => {
  const handleSubmit = jest.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  const input = screen.getByLabelText('Username');
  fireEvent.change(input, { target: { value: 'ash123' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(handleSubmit).toHaveBeenCalledWith('ash123');
});`,
        output: 'The test passes: getByLabelText finds the input via its associated <label>, fireEvent.change simulates typing "ash123", and clicking "Log In" triggers the form submit handler, which calls the mocked onSubmit function with "ash123" as expected.',
      },
    ],
    commonMistakes: [
      'Querying elements by CSS class or test-only implementation details instead of by visible text, label, or ARIA role, making tests brittle to styling changes.',
      'Testing internal component state directly instead of the rendered output a user would actually see.',
      'Forgetting to import the jest-dom matchers (like toBeInTheDocument), causing confusing "not a function" errors on assertions.',
      'Using getByText/getByRole (which throw immediately if not found) when queryByText or findByText would be more appropriate for optional or asynchronous elements.',
    ],
    keyPoints: [
      'React Testing Library encourages testing components the way a user interacts with them, via visible text, labels, and roles.',
      'render() mounts a component for testing; screen provides query methods to find elements in the rendered output.',
      'fireEvent (or the more realistic userEvent) simulates user interactions like clicks and typing.',
      'Prefer asserting on visible behavior over internal state, so tests stay valid across refactors that don\'t change user-facing behavior.',
    ],
  },

  deployment: {
    title: 'Building and Deploying a React Application',
    intro: `Development mode in React (via tools like Vite or Create React App) prioritizes fast feedback — hot reloading, unminified code, and helpful warnings — none of which belong in front of real users. Before deploying, a React app must be compiled into an optimized "production build": minified, bundled, and stripped of development-only warnings, ready to be served as static files.

Because React apps compiled this way are just HTML, CSS, and JavaScript files with no server-side logic required, they can be hosted on virtually any static file host or CDN, which is both simple and inexpensive compared to running a full application server.`,
    sections: [
      {
        heading: 'Creating a Production Build',
        body: `Running <code>npm run build</code> (the exact script name may vary slightly between Vite and Create React App, but the concept is identical) compiles the application into a small set of static files — typically an <code>index.html</code> plus hashed, minified JavaScript and CSS bundles — placed into a <code>build</code> or <code>dist</code> folder. This process removes development warnings, minifies code to reduce file size, and often splits code into smaller chunks so users only download what a given page needs.`,
      },
      {
        heading: 'Static Hosting Basics',
        body: `Because the build output is just static files, it can be hosted on services like Netlify, Vercel, GitHub Pages, or any plain web server/CDN — no Node.js server is required to serve the app itself (a separate backend API, if any, is deployed independently). One routing detail matters for single-page apps: since React Router handles navigation client-side, the host must be configured to serve <code>index.html</code> for all unknown paths (a "rewrite" or "fallback" rule), otherwise refreshing a page like <code>/users/42</code> directly will 404 on a naive static host.`,
      },
      {
        heading: 'Environment Variables',
        body: `Configuration that differs between environments — an API base URL for staging versus production, for example — is handled through environment variables baked in at build time, not at runtime. In Vite projects these must be prefixed with <code>VITE_</code> (e.g. <code>VITE_API_URL</code>) and accessed via <code>import.meta.env.VITE_API_URL</code>; in Create React App projects they must be prefixed with <code>REACT_APP_</code> and accessed via <code>process.env.REACT_APP_API_URL</code>. Because these values are compiled directly into the static JavaScript bundle, they are visible to anyone who inspects the deployed files — secrets like private API keys must never be placed in frontend environment variables.`,
        list: [
          'Vite: variables must start with <code>VITE_</code> and are read via <code>import.meta.env.VITE_SOMETHING</code>.',
          'Create React App: variables must start with <code>REACT_APP_</code> and are read via <code>process.env.REACT_APP_SOMETHING</code>.',
          'Never store true secrets (private keys, database credentials) in frontend env variables — they end up readable in the shipped JavaScript.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Reading a build-time environment variable in a Vite-based React app',
        code: `// .env.production (not committed with real secrets)
// VITE_API_URL=https://api.example.com

// apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchProducts() {
  const response = await fetch(\`\${API_BASE_URL}/products\`);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }
  return response.json();
}

// Build and preview the production bundle locally:
// npm run build
// npm run preview`,
        output: 'After "npm run build", a dist/ folder is created containing minified index.html, JS, and CSS files with VITE_API_URL already compiled in as "https://api.example.com". "npm run preview" serves that production build locally so you can verify it before deploying it to static hosting.',
      },
    ],
    commonMistakes: [
      'Deploying the "dev" server output instead of running a production build first — development mode is far larger and slower, and not meant for real users.',
      'Forgetting to configure a single-page-app fallback rule on the static host, causing direct navigation or refreshes on client-side routes (like /users/42) to 404.',
      'Putting a secret API key in a VITE_ or REACT_APP_ environment variable, not realizing it gets bundled into publicly readable JavaScript.',
      'Expecting an environment variable change to take effect without rebuilding — these values are baked in at build time, not read at runtime.',
    ],
    keyPoints: [
      'npm run build produces an optimized, minified static bundle ready for production hosting.',
      'React apps can be served from any static host or CDN; single-page apps need a fallback rule routing all paths to index.html.',
      'Environment variables must use the framework\'s required prefix (VITE_ or REACT_APP_) and are baked into the bundle at build time.',
      'Never place real secrets in frontend environment variables, since the built JavaScript is publicly inspectable.',
    ],
  },
}
