// Extra "getting started / environment setup" and modern market-trend lessons.
// Six named exports, one per course. Keys are slugs matching topics.js entries.

export const htmlExtra = {
  'setting-up-your-editor-and-browser-devtools': {
    title: 'Setting Up Your Editor and Browser DevTools',
    intro: `Before you write a single tag, it pays to spend ten minutes setting up the two tools you will use in every HTML lesson from here on: a code editor and your browser's built-in DevTools. A good setup turns "edit, save, alt-tab, refresh, look" into a fast, almost invisible loop, which matters enormously when you are learning by trial and error.

This lesson does not assume any prior tooling experience. It walks through installing an editor, adding one extension that removes the need to manually refresh your browser, and opening the DevTools panel that lets you inspect and debug the page you just built.`,
    sections: [
      {
        heading: 'Choosing and Configuring an Editor',
        body: `Visual Studio Code (VS Code) is the de facto standard code editor for web development: it is free, cross-platform, has excellent HTML/CSS/JavaScript support out of the box, and has a massive extension ecosystem. Install it, then add the "Live Server" extension.`,
        list: [
          'Download VS Code from the official site and install it for your operating system.',
          'Open the Extensions panel (the square-icon sidebar) and search for "Live Server" by Ritwick Dey — install it.',
          'Open a folder (not just a single file) in VS Code so relative links between your HTML, CSS, and image files resolve correctly.',
          'Right-click any .html file in the editor and choose "Open with Live Server" to launch it in your default browser on a local address like http://127.0.0.1:5500.',
        ],
      },
      {
        heading: 'The Edit-Save-Refresh Workflow',
        body: `With Live Server running, the workflow becomes: edit your HTML file, save it (Ctrl+S / Cmd+S), and the browser tab reloads automatically to show your change — no manual refresh needed. This tight feedback loop is what makes learning HTML by experimentation practical instead of tedious. Without Live Server you would need to double-click the HTML file to open it as a plain file:// URL and manually refresh after every change, which still works for very simple pages but breaks down once you add features that expect a real server (like fetch requests).`,
      },
      {
        heading: 'Opening and Using Browser DevTools',
        body: `Every modern browser (Chrome, Firefox, Edge, Safari) ships with a DevTools panel. Open it with F12 or Ctrl+Shift+I (Cmd+Option+I on Mac), or by right-clicking any element on the page and choosing "Inspect."`,
        list: [
          '<strong>Elements tab</strong> — shows the live DOM tree and the exact CSS applied to whatever element you select; you can edit HTML/CSS here temporarily to experiment without touching your files.',
          '<strong>Console tab</strong> — shows errors (like a broken image path or a JavaScript exception) and lets you run JavaScript directly against the loaded page.',
          '<strong>Network tab</strong> — shows every file the page requested (HTML, CSS, images, scripts) along with status codes, so you can immediately spot a 404 for a mistyped filename.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A minimal page to test your Live Server + DevTools setup',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Setup Check</title>
</head>
<body>
  <h1 id="greeting">Hello, Webnest!</h1>
  <p>If Live Server is working, editing this text and saving should refresh the page automatically.</p>
</body>
</html>`,
        output: 'The browser opens a page showing a heading "Hello, Webnest!" followed by a paragraph. Editing the heading text and saving the file causes the browser tab to reload automatically within about a second, without you switching windows or pressing refresh.',
      },
      {
        caption: 'Using the Console tab to confirm the page is inspectable',
        code: `// Typed directly into the DevTools Console tab, not saved in a file
document.getElementById('greeting').style.color = 'crimson';`,
        output: 'The heading text "Hello, Webnest!" immediately turns crimson red in the rendered page, and the Console echoes the string "crimson" as the return value of the assignment — confirming DevTools has live access to the page.',
      },
    ],
    commonMistakes: [
      'Opening a single HTML file directly by double-clicking it (a file:// URL) and then wondering why Live Server\'s auto-refresh is not working — Live Server requires opening a folder as a VS Code workspace and launching from within the editor.',
      'Editing styles directly in the Elements tab and expecting the change to persist — DevTools edits are temporary and disappear on refresh; you must copy real changes back into your CSS file.',
      'Never checking the Network tab and being confused when an image does not appear — a quick look at Network usually reveals a 404 caused by a typo in the file path.',
      'Ignoring red error messages in the Console tab, which almost always point directly at the line and file causing a problem.',
    ],
    keyPoints: [
      'VS Code plus the Live Server extension gives you automatic browser refresh on save, which is the standard beginner workflow.',
      'Open DevTools with F12 or right-click → Inspect; the Elements, Console, and Network tabs cover most day-to-day debugging needs.',
      'Elements tab edits are temporary and exist only in the browser session — always make the real change in your source file.',
      'The Network tab is the fastest way to diagnose missing files, broken links, and failed requests.',
    ],
  },

  'web-components-basics': {
    title: 'Web Components Basics',
    intro: `Web Components are a set of native browser APIs that let you build your own custom, reusable HTML elements — things like <code>&lt;my-tabs&gt;</code> or <code>&lt;user-card&gt;</code> — that encapsulate their own markup, styling, and behavior. Unlike a React component or a Vue component, a Web Component is not tied to any particular framework: it works the same way in plain HTML, in a React app, in a Vue app, or anywhere else, because it is built directly on browser standards rather than a library.

This makes Web Components especially useful for design systems and shared UI libraries that need to work across teams using different frontend frameworks, or across an organization that has not standardized on one framework at all.`,
    sections: [
      {
        heading: 'The Three Core Technologies',
        body: `"Web Components" is really an umbrella term for three separate browser specifications that are typically used together.`,
        list: [
          '<strong>Custom Elements</strong> — the API (<code>customElements.define()</code>) that lets you register a new HTML tag name backed by a JavaScript class, with its own lifecycle callbacks.',
          '<strong>Shadow DOM</strong> — an encapsulated, isolated DOM subtree attached to an element; CSS and querySelector calls from outside cannot accidentally reach into it, and its internal styles cannot leak out.',
          '<strong>HTML Templates</strong> — the <code>&lt;template&gt;</code> tag, which holds inert markup that is parsed by the browser but not rendered until you clone it into the page with JavaScript, making it an efficient stamp for repeated structure.',
        ],
      },
      {
        heading: 'Defining a Custom Element',
        body: `You create a custom element by extending HTMLElement (or a built-in element type), then registering it with <code>customElements.define('tag-name', ClassName)</code>. Custom element tag names must contain a hyphen (e.g. <code>user-card</code>, not <code>usercard</code>) specifically so the browser can distinguish them from current and future standard HTML tags. Lifecycle callbacks like <code>connectedCallback()</code> run automatically when the element is inserted into the page.`,
      },
      {
        heading: 'Why This Matters for Framework-Agnostic UI',
        body: `Because a registered custom element behaves like any other native HTML tag, you can drop <code>&lt;user-card&gt;</code> into a static HTML page, a React JSX tree, or an Angular template, and it will render and function identically in all three — the browser handles it directly, with no adapter code required. This is why component libraries aimed at multiple teams (for example, a company-wide design system) are increasingly built as Web Components rather than framework-specific components.`,
      },
    ],
    examples: [
      {
        caption: 'A simple custom element with encapsulated Shadow DOM styling',
        code: `<!-- index.html -->
<user-card name="Asha Patel" role="Frontend Engineer"></user-card>

<script>
  class UserCard extends HTMLElement {
    connectedCallback() {
      const name = this.getAttribute('name');
      const role = this.getAttribute('role');

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = \`
        <style>
          .card { border: 1px solid #ccc; border-radius: 8px; padding: 12px; font-family: sans-serif; }
          .name { font-weight: bold; }
        </style>
        <div class="card">
          <div class="name">\${name}</div>
          <div class="role">\${role}</div>
        </div>
      \`;
    }
  }

  customElements.define('user-card', UserCard);
</script>`,
        output: 'The page renders a bordered, rounded card showing "Asha Patel" in bold above "Frontend Engineer." The card\'s internal .card and .name CSS classes are scoped inside the Shadow DOM, so they never clash with any .card or .name class defined elsewhere on the page.',
      },
    ],
    commonMistakes: [
      'Forgetting the required hyphen in a custom element tag name (e.g. writing "usercard" instead of "user-card") — the browser will refuse to register it.',
      'Expecting global page CSS to style inside a Shadow DOM automatically — encapsulation means outside styles do not apply unless explicitly passed in (for example, via CSS custom properties).',
      'Doing heavy setup work in the class constructor instead of connectedCallback — the constructor runs before the element is guaranteed to be attached to the document, which can cause subtle bugs.',
      'Assuming Web Components replace frameworks entirely — they are a low-level tool for building interoperable pieces, and many teams still use a framework on top for routing, state management, and data fetching.',
    ],
    keyPoints: [
      'Web Components combine three standards: Custom Elements, Shadow DOM, and HTML Templates.',
      'customElements.define("tag-name", ClassName) registers a new element; tag names must include a hyphen.',
      'Shadow DOM encapsulates markup and styles so they cannot leak in or out of the component.',
      'Because they are native browser features, Web Components work identically across any framework or no framework at all.',
    ],
  },
};

export const cssExtra = {
  'setting-up-a-css-workflow': {
    title: 'Setting Up a CSS Workflow',
    intro: `CSS is easiest to learn when you can see the effect of a change immediately, and easiest to work with professionally when your workflow scales past a single stylesheet. This lesson covers the practical setup: linking a stylesheet correctly, using browser DevTools to experiment with styles live, and understanding when it becomes worth introducing a preprocessor or a build step.`,
    sections: [
      {
        heading: 'Linking a Stylesheet',
        body: `CSS is connected to HTML with a <code>&lt;link&gt;</code> tag inside <code>&lt;head&gt;</code>: <code>&lt;link rel="stylesheet" href="styles.css"&gt;</code>. The path in <code>href</code> is resolved relative to the HTML file's location, so a common beginner error is an incorrect relative path when files are organized into folders.`,
      },
      {
        heading: 'Live-Editing Styles in DevTools',
        body: `Open DevTools (F12), select an element in the Elements tab, and the Styles pane on the right shows every CSS rule applying to it, including which stylesheet and line number each rule comes from. You can toggle properties on and off, edit values, and add new declarations directly in this pane to test ideas instantly — changes here are temporary and vanish on reload, so once you find a value you like, copy it back into your actual .css file.`,
        list: [
          'Click any property value (like a color or a margin) to edit it in place and see the page update immediately.',
          'Use the "+" button in the Styles pane to add a brand-new rule for testing.',
          'The "Computed" sub-tab shows the final resolved value of every CSS property after all rules and inheritance are applied — useful when several rules are competing.',
        ],
      },
      {
        heading: 'When to Introduce a Preprocessor or Build Step',
        body: `For a single page or a small project, a plain linked .css file is entirely sufficient. As a project grows — multiple pages sharing colors and spacing, deeply nested component styles, or a need to split styles into many organized files — a preprocessor like Sass (.scss) becomes useful. Sass adds variables, nesting, and reusable mixins, and compiles down to plain CSS that browsers already understand, so you introduce a small build step (via a tool like Vite or the Sass CLI) that watches your .scss files and outputs .css automatically. Modern CSS has closed part of this gap natively with custom properties (variables) and nesting, so many projects now delay reaching for Sass longer than they used to.`,
      },
    ],
    examples: [
      {
        caption: 'A correctly linked stylesheet with a basic rule',
        code: `<!-- index.html -->
<head>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <h1 class="title">Getting Started</h1>
</body>`,
        output: 'The page loads css/styles.css relative to index.html. If styles.css contains ".title { color: teal; }", the heading text renders in teal — visible immediately, with no build step required.',
      },
      {
        caption: 'A minimal Sass file compiling down to plain CSS',
        code: `// styles.scss
$primary: teal;

.title {
  color: $primary;
  &:hover {
    color: darken($primary, 15%);
  }
}

/* Compiles to: */
/*
.title { color: teal; }
.title:hover { color: #0a4d4d; }
*/`,
        output: 'Running the Sass compiler produces a plain .css file with the variable substituted and the nested &:hover rule expanded into a standard descendant-free selector, ready to link into HTML exactly like a hand-written stylesheet.',
      },
    ],
    commonMistakes: [
      'Using an incorrect relative path in the href of the link tag after reorganizing files into subfolders, resulting in unstyled ("naked") HTML with no console error explaining why.',
      'Editing styles only in DevTools and forgetting to copy the final values back into the actual CSS file, losing the change on the next reload.',
      'Reaching for Sass and a full build pipeline on a two-page static site where a plain linked stylesheet would have been simpler and sufficient.',
      'Forgetting that browsers do not understand .scss files directly — they must be compiled to .css before being linked in HTML.',
    ],
    keyPoints: [
      'Stylesheets are linked with <link rel="stylesheet" href="..."> in the document head, with the path resolved relative to the HTML file.',
      'The DevTools Styles pane lets you live-edit CSS and see the source file and line number for every applied rule; the Computed tab shows final resolved values.',
      'A preprocessor like Sass adds variables, nesting, and mixins, compiling down to plain CSS through a small build step.',
      'Native CSS variables and nesting have reduced how early projects need to reach for a preprocessor.',
    ],
  },

  'container-queries': {
    title: 'Container Queries',
    intro: `Media queries let you style elements based on the size of the browser viewport, but that has always been an awkward fit for reusable components: a card component might sit in a wide main column on one page and a narrow sidebar on another, and its ideal layout depends on the space it actually has — not on the overall screen size. Container queries solve exactly this problem by letting an element respond to the size of its containing element instead of the viewport.

Container queries are a genuinely modern CSS feature (broadly supported in evergreen browsers since 2023) and represent one of the most requested capabilities in CSS's history, because component-based design (React, Vue, design systems) had outgrown what viewport-based media queries could express.`,
    sections: [
      {
        heading: 'Declaring a Containment Context',
        body: `To make an element queryable by its children, you opt it in with <code>container-type</code> on the parent: <code>container-type: inline-size</code> (the common case, tracking width) or <code>size</code> (tracking both width and height). An optional <code>container-name</code> lets you target a specific container by name when queries could otherwise be ambiguous.`,
      },
      {
        heading: 'Writing an @container Rule',
        body: `Inside a rule, <code>@container (min-width: 400px) { ... }</code> applies its nested styles whenever the nearest ancestor with a containment context is at least 400px wide — regardless of how wide the browser window itself is. This is the key difference from <code>@media</code>, which only ever looks at the viewport.`,
      },
      {
        heading: 'Why This Beats Media Queries for Components',
        body: `A card component styled with container queries looks correct whether it's dropped into a full-width page, a narrow sidebar, or a three-column grid, because its internal layout reacts to its own available space rather than a global breakpoint. This makes components genuinely reusable across contexts — which is exactly the promise component libraries and design systems are built on — without the component needing to know or guess where it will be placed.`,
      },
    ],
    examples: [
      {
        caption: 'A card that switches from stacked to side-by-side layout based on its container width, not the viewport',
        code: `<div class="card-container">
  <div class="card">
    <img src="avatar.jpg" alt="">
    <div class="card-body">
      <h3>Asha Patel</h3>
      <p>Frontend Engineer</p>
    </div>
  </div>
</div>

<style>
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: flex;
  flex-direction: column;
}

@container card (min-width: 350px) {
  .card {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }
}
</style>`,
        output: 'When .card-container is narrower than 350px (e.g. in a sidebar), the avatar image stacks above the text. When the same markup is placed in a wider container of 350px or more (e.g. a main content column), the layout automatically switches to a side-by-side row with the avatar next to the text — with no JavaScript and no change to the viewport width.',
      },
    ],
    commonMistakes: [
      'Writing an @container rule without first declaring container-type on an ancestor — without a containment context declared somewhere up the tree, the @container query has nothing to measure and its styles never apply.',
      'Confusing @container with @media and expecting it to react to window resizing directly — it reacts to the named container\'s size, which may or may not track the viewport.',
      'Setting container-type: inline-size on the same element you are trying to style with @container — the containment context must be on an ancestor, not the element being conditionally styled.',
      'Forgetting that older browsers (pre-2023) do not support container queries, and shipping a component with no fallback layout for those environments if long-tail browser support matters for the project.',
    ],
    keyPoints: [
      'Container queries style an element based on the size of an ancestor container, not the viewport.',
      'container-type: inline-size (or size) on a parent opts it into being queryable; container-name optionally scopes queries to that container.',
      '@container (min-width: ...) { ... } applies styles once the named container reaches that size.',
      'They make components genuinely portable across different layout contexts, which media queries alone could never achieve.',
    ],
  },
};

export const javascriptExtra = {
  'setting-up-a-javascript-environment': {
    title: 'Setting Up a JavaScript Environment',
    intro: `JavaScript can run in two very different places: inside a web browser, where it was born, and outside the browser via Node.js, which lets you run JavaScript as a standalone program the same way you would run a Python or Ruby script. Knowing how to use both environments — the browser console for quick experiments, and Node.js for real scripts and tooling — is a foundational skill before moving on to more advanced JavaScript topics.`,
    sections: [
      {
        heading: 'Experimenting in the Browser Console',
        body: `Every browser's DevTools (F12, then the Console tab) includes a live JavaScript interpreter tied to the current page. Typing an expression and pressing Enter evaluates it immediately and prints the result — no file, no setup, nothing to save. This makes the console the fastest way to test a small idea, like how <code>Array.prototype.map</code> behaves or what a particular date format looks like, before writing it into real code.`,
      },
      {
        heading: 'Installing Node.js',
        body: `Node.js is a JavaScript runtime built on Chrome's V8 engine that lets JavaScript run outside any browser — on a server, in a build tool, or as a command-line script. Download the LTS (Long-Term Support) version from nodejs.org and install it; this also installs npm (Node Package Manager) automatically. Verify the install by running <code>node -v</code> and <code>npm -v</code> in a terminal, which print the installed version numbers.`,
      },
      {
        heading: 'Using npm and Running a Script File',
        body: `npm is used to install reusable packages published by other developers (for example, <code>npm install lodash</code> downloads that library into a local <code>node_modules</code> folder) and to run project scripts defined in a <code>package.json</code> file. To run a plain JavaScript file directly, save it with a .js extension and run <code>node script.js</code> from a terminal in that folder — Node executes the file top to bottom and prints any <code>console.log</code> output to the terminal.`,
      },
    ],
    examples: [
      {
        caption: 'Quick experimentation in the browser console',
        code: `// Typed directly into DevTools Console, not saved to a file
const nums = [1, 2, 3, 4, 5];
nums.filter(n => n % 2 === 0).map(n => n * 10);`,
        output: '[20, 40] — the console immediately evaluates and prints the resulting array, with no file or setup needed.',
      },
      {
        caption: 'Running a standalone script with Node.js',
        code: `// script.js
function greet(name) {
  return \`Hello, \${name}! This ran outside the browser.\`;
}

console.log(greet('Webnest'));
console.log('Node version check:', process.version);`,
        output: `Hello, Webnest! This ran outside the browser.
Node version check: v20.11.0`,
      },
    ],
    commonMistakes: [
      'Trying to use browser-only globals like "document" or "window" inside a Node.js script — Node has no DOM, since there is no browser page involved.',
      'Forgetting to save the file before running "node script.js," so Node executes an older, stale version of the code.',
      'Running "node" with no filename and expecting it to run a script — with no argument, Node opens an interactive REPL prompt instead of executing a file.',
      'Installing packages globally out of habit when a project-local install (the npm default) is what most tooling and tutorials expect.',
    ],
    keyPoints: [
      'The browser console is ideal for quick, throwaway experiments tied to the currently loaded page.',
      'Node.js runs JavaScript outside the browser and is installed from nodejs.org, bundling npm alongside it.',
      'npm installs third-party packages and can run scripts defined in package.json.',
      '"node script.js" executes a JavaScript file from the terminal, printing console.log output directly to that terminal.',
    ],
  },

  'introduction-to-typescript': {
    title: 'Introduction to TypeScript',
    intro: `TypeScript is a typed superset of JavaScript developed by Microsoft: every valid JavaScript program is also valid TypeScript, but TypeScript adds an optional static type system on top. TypeScript code is never run directly by a browser or Node.js — it is compiled ("transpiled") down to plain JavaScript by the TypeScript compiler (<code>tsc</code>) or a build tool, and it is that resulting JavaScript that actually executes.

The core value proposition is catching a whole category of bugs at compile time — before the code ever runs — that plain JavaScript would only reveal at runtime, often in production, in front of a real user. This single benefit is why TypeScript has become the de facto standard for professional JavaScript codebases, from large frontend applications to backend Node.js services.`,
    sections: [
      {
        heading: 'Basic Type Annotations',
        body: `You annotate a variable, parameter, or return value with a colon followed by a type: <code>let age: number = 25;</code> or <code>function greet(name: string): string { ... }</code>. If you later try to assign a value of the wrong type, TypeScript reports an error immediately in your editor, long before you run the code.`,
        list: [
          'Primitive types: <code>string</code>, <code>number</code>, <code>boolean</code>.',
          'Array types: <code>number[]</code> or <code>Array&lt;number&gt;</code>.',
          '<code>any</code> opts out of type checking entirely for that value — useful sparingly, but overusing it defeats the purpose of TypeScript.',
          '<code>unknown</code> is a safer alternative to any: it forces you to narrow the type before using the value.',
        ],
      },
      {
        heading: 'Interfaces',
        body: `An <code>interface</code> describes the expected shape of an object — which properties it must have and what types they are. Interfaces are a purely compile-time construct: they exist to help the type checker (and other developers reading the code) and produce no JavaScript output at all once compiled.`,
      },
      {
        heading: 'Compile-Time Errors vs. Runtime Errors',
        body: `In plain JavaScript, passing the wrong shape of object to a function often does not fail immediately — it may silently produce <code>undefined</code>, or throw an exception minutes later deep inside unrelated code, far from the actual mistake. TypeScript's compiler flags the mismatch at the moment you write it, pointing directly at the offending line, which is a dramatically faster and cheaper feedback loop than discovering the same bug in production.`,
      },
    ],
    examples: [
      {
        caption: 'An interface and typed function catching a mistake before the code ever runs',
        code: `interface User {
  id: number;
  name: string;
  email: string;
}

function sendWelcomeEmail(user: User): string {
  return \`Welcome, \${user.name}! A confirmation was sent to \${user.email}.\`;
}

const validUser: User = { id: 1, name: 'Asha', email: 'asha@example.com' };
console.log(sendWelcomeEmail(validUser));

// The next line is a compile-time error, caught before running:
// sendWelcomeEmail({ id: 2, name: 'Ravi' });
// Error: Property 'email' is missing in type '{ id: number; name: string; }'
// but required in type 'User'.`,
        output: `Welcome, Asha! A confirmation was sent to asha@example.com.
(The commented-out call fails to compile with: Property 'email' is missing in type '{ id: number; name: string; }' but required in type 'User'.)`,
      },
    ],
    commonMistakes: [
      'Overusing the "any" type to silence errors quickly, which quietly disables type checking for that value and reintroduces the exact runtime bugs TypeScript exists to prevent.',
      'Forgetting that TypeScript must be compiled to JavaScript before it runs anywhere — browsers and Node.js cannot execute .ts files directly.',
      'Assuming TypeScript checks values at runtime — its type system is erased entirely during compilation and provides zero runtime protection against, say, unexpected API responses unless you validate them separately.',
      'Writing overly complex, deeply nested types for simple data early on, when a plain interface and a few basic types would communicate the same intent more clearly.',
    ],
    keyPoints: [
      'TypeScript is a typed superset of JavaScript: valid JS is valid TS, and TS compiles down to plain JS to actually run.',
      'Type annotations (string, number, boolean, arrays, custom interfaces) let the compiler check correctness before code ever executes.',
      'Interfaces describe object shapes at compile time and produce no runtime JavaScript themselves.',
      'Catching type mismatches at compile time rather than at runtime is TypeScript\'s core value, which is why it has become standard in professional JS codebases.',
    ],
  },
};

export const reactExtra = {
  'setting-up-a-react-project': {
    title: 'Setting Up a React Project',
    intro: `Before you can write a single component, you need a project scaffold: a folder structure, a build tool that turns JSX into browser-runnable JavaScript, and a local dev server with fast reload. For years the default answer was Create React App (CRA), but CRA is no longer actively maintained and is slow compared to modern alternatives. Today, Vite is the recommended way to start a new React project, and it is what you'll see in current documentation, tutorials, and most new codebases.`,
    sections: [
      {
        heading: 'Vite vs. Create React App',
        body: `Vite uses native ES modules during development, so it starts a dev server almost instantly and updates the browser via Hot Module Replacement (HMR) in milliseconds, even in fairly large projects. Create React App, by contrast, bundles the entire app with Webpack before it can serve anything, which becomes noticeably slower to start and to reload as a project grows. CRA also stopped receiving meaningful updates, while Vite is actively developed and now the approach recommended in React's own documentation.`,
      },
      {
        heading: 'Creating a New Project with Vite',
        body: `Run <code>npm create vite@latest my-app -- --template react</code> (or the TypeScript variant <code>react-ts</code>) in a terminal, then <code>cd my-app</code>, <code>npm install</code>, and <code>npm run dev</code>. This produces a working React app with a dev server running, typically at http://localhost:5173.`,
      },
      {
        heading: 'The Resulting Project Structure',
        body: `A fresh Vite + React project includes a small, easy-to-read set of files and folders rather than the deeply nested configuration CRA used to generate.`,
        list: [
          '<code>index.html</code> — the single real HTML file, at the project root, containing a <code>&lt;div id="root"&gt;&lt;/div&gt;</code> that React mounts into.',
          '<code>src/main.jsx</code> — the entry point that renders your root <code>&lt;App /&gt;</code> component into that div.',
          '<code>src/App.jsx</code> — the starting component you edit first.',
          '<code>package.json</code> — lists dependencies and defines scripts like <code>dev</code>, <code>build</code>, and <code>preview</code>.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Scaffolding and running a new Vite + React project',
        code: `# Terminal
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

# Output in terminal:
#   VITE v5.x.x  ready in 320 ms
#   ➜  Local:   http://localhost:5173/`,
        output: 'A dev server starts in a few hundred milliseconds. Opening http://localhost:5173 in a browser shows the default Vite + React starter page with a spinning logo and a counter button. Editing src/App.jsx and saving updates the page in the browser almost instantly, without a full reload.',
      },
    ],
    commonMistakes: [
      'Starting a brand-new project with "npx create-react-app" out of habit, without realizing it is effectively unmaintained and noticeably slower than Vite for both startup and rebuilds.',
      'Forgetting to run "npm install" after scaffolding the project, then getting confusing "module not found" errors when running "npm run dev".',
      'Editing index.html expecting to see UI changes, when the actual UI comes from the React component tree rendered into the single <div id="root"> — index.html itself rarely needs edits.',
      'Confusing the dev server (npm run dev, for local development with hot reload) with the production build (npm run build, which outputs static optimized files meant for deployment).',
    ],
    keyPoints: [
      'Vite is the modern, recommended way to start a React project; Create React App is legacy and no longer actively maintained.',
      '"npm create vite@latest" scaffolds a project; "npm install" then "npm run dev" gets it running locally.',
      'A Vite React project centers on index.html, src/main.jsx (entry point), and src/App.jsx (root component).',
      'Vite\'s speed comes from serving native ES modules directly during development instead of bundling everything upfront.',
    ],
  },

  'typescript-in-react': {
    title: 'TypeScript in React',
    intro: `Combining TypeScript with React lets you describe exactly what props a component expects and what shape its state takes, so mistakes like passing a number where a string was expected, or forgetting a required prop entirely, are caught by your editor and the compiler before the app ever runs. This is one of the most common and highest-value uses of TypeScript in professional frontend work, since prop-related bugs are a frequent source of confusing runtime behavior in plain JavaScript React apps.`,
    sections: [
      {
        heading: 'Typing Component Props with an Interface',
        body: `You define an interface describing the props a component accepts, then use it as the type of the function's single props parameter: <code>function UserCard({ name, age }: UserCardProps)</code>. Optional props are marked with a question mark (<code>age?: number</code>), and any prop not marked optional is required — omitting it is a compile-time error, not a silent <code>undefined</code> discovered later.`,
      },
      {
        heading: 'Typing useState with a Generic',
        body: `<code>useState</code> infers its type from the initial value by default (<code>useState(0)</code> infers <code>number</code>), but when the initial value doesn't fully describe the type — commonly when starting from <code>null</code> or an empty array — you supply the type explicitly as a generic: <code>useState&lt;User | null&gt;(null)</code>. This tells TypeScript the state will eventually hold a <code>User</code> object, even though it starts out as <code>null</code>, so later code that reads it is checked against the full type.`,
      },
      {
        heading: 'Why Typed Props Prevent a Whole Class of Bugs',
        body: `Without types, passing <code>&lt;UserCard age="25" /&gt;</code> (a string) where a number was intended, or forgetting the required <code>name</code> prop entirely, produces no error — the component simply renders incorrectly or displays "undefined" somewhere, and you have to trace the bug back through the component tree. With a typed <code>UserCardProps</code> interface, the exact same mistake is flagged by the editor the moment you write the JSX, with a message naming the offending prop and the expected type.`,
      },
    ],
    examples: [
      {
        caption: 'A typed functional component with a typed useState hook',
        code: `import { useState } from 'react';

interface User {
  id: number;
  name: string;
}

interface UserCardProps {
  name: string;
  age?: number;
}

function UserCard({ name, age }: UserCardProps) {
  return (
    <div className="card">
      <h3>{name}</h3>
      {age !== undefined && <p>Age: {age}</p>}
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <UserCard name="Asha Patel" age={28} />
      <button onClick={() => setUser({ id: 1, name: 'Ravi Kumar' })}>
        Load User
      </button>
      {user && <p>Loaded: {user.name}</p>}
    </div>
  );
}

// The following would fail to compile:
// <UserCard age={28} />
// Error: Property 'name' is missing in type '{ age: number; }'
// but required in type 'UserCardProps'.`,
        output: 'The page renders a card showing "Asha Patel" and "Age: 28," plus a "Load User" button. Clicking it sets state and renders "Loaded: Ravi Kumar" below. The commented-out <UserCard age={28} /> line fails to compile because the required "name" prop is missing, catching the mistake before the app ever runs.',
      },
    ],
    commonMistakes: [
      'Typing useState\'s initial null value with no generic (e.g. "useState(null)"), which infers the type as "null" forever and causes errors the moment you try to assign a real object to that state later.',
      'Marking a prop optional (with "?") when the component actually requires it to render correctly, which just hides a bug that will still surface as a runtime error inside the component.',
      'Defining the same shape as both a "type" and an "interface" for a prop in different files, causing confusing duplicate-definition or mismatch errors as the codebase grows.',
      'Using "any" for props "to make the error go away" instead of fixing the actual shape mismatch, which silently reintroduces the exact class of bug TypeScript was added to prevent.',
    ],
    keyPoints: [
      'Component props are typed with an interface, used as the type annotation on the destructured props parameter.',
      'useState infers its type from the initial value, but a generic like useState<User | null>(null) is needed when the initial value alone doesn\'t describe the eventual type.',
      'Typed props turn missing or mismatched props into compile-time errors instead of confusing runtime bugs.',
      'TypeScript with React is now the standard combination in professional codebases, precisely because prop-shape bugs are so common in plain JavaScript React code.',
    ],
  },
};

export const databaseSqlExtra = {
  'setting-up-a-local-database-for-practice': {
    title: 'Setting Up a Local Database for Practice',
    intro: `Reading about SQL only gets you so far — actually running queries against a real database is what makes the syntax and concepts stick. This lesson walks through getting a working database on your own machine (or a free hosted alternative), connecting to it with either a GUI tool or the command-line client, and creating your first practice database and table.`,
    sections: [
      {
        heading: 'Installing PostgreSQL or MySQL Locally',
        body: `PostgreSQL and MySQL are the two most widely used open-source relational databases, and either is a fine choice for learning SQL — the core language is nearly identical between them, with only minor syntax differences. Download the installer for your operating system from the official PostgreSQL or MySQL site and run it; the installer typically also sets up a default admin user and asks you to set a password during setup. If you'd rather avoid a local install, hosted free-tier services (such as Supabase or Neon for PostgreSQL, or PlanetScale for MySQL) give you a real remote database in a couple of minutes, reachable with the same tools and the same SQL.`,
      },
      {
        heading: 'Connecting with a GUI Client or the CLI',
        body: `A GUI database client shows your tables, columns, and data visually and is often friendlier while learning. Popular options include TablePlus, DBeaver, and pgAdmin (which ships alongside PostgreSQL). To connect, you supply a host (usually <code>localhost</code> for a local install), port (5432 for PostgreSQL, 3306 for MySQL by default), username, password, and database name. Alternatively, the command-line clients <code>psql</code> (PostgreSQL) and <code>mysql</code> (MySQL) let you type SQL directly in a terminal: <code>psql -U postgres -d postgres</code> or <code>mysql -u root -p</code>.`,
      },
      {
        heading: 'Creating Your First Practice Database and Table',
        body: `Once connected, create a dedicated database to practice in — keeping it separate from any default system database avoids accidentally cluttering or breaking anything the tool itself relies on. Then create a simple table and insert a few rows to confirm everything works end to end.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a practice database and table in PostgreSQL via psql',
        code: `-- Run inside psql after connecting
CREATE DATABASE practice_db;

\\c practice_db

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade INT
);

INSERT INTO students (name, grade) VALUES ('Asha Patel', 92), ('Ravi Kumar', 85);

SELECT * FROM students;`,
        output: `You are now connected to database "practice_db" as user "postgres".
CREATE TABLE
INSERT 0 2
 id |    name     | grade
----+-------------+-------
  1 | Asha Patel  |    92
  2 | Ravi Kumar  |    85
(2 rows)`,
      },
    ],
    commonMistakes: [
      'Forgetting the password set during installation and getting locked out of the default admin account — most installers let you reset it, but it is worth writing it down immediately during setup.',
      'Practicing directly inside a database the tool itself uses internally (like "postgres" or "mysql") instead of creating a separate practice database, risking confusing errors if something is accidentally dropped or altered.',
      'Mixing up the default ports (5432 for PostgreSQL vs 3306 for MySQL) when configuring a GUI client connection, resulting in a generic "connection refused" error.',
      'Assuming a hosted free-tier database has no limits — most free tiers cap storage, connection count, or automatically pause an idle database after a period of inactivity.',
    ],
    keyPoints: [
      'PostgreSQL and MySQL are both solid, free choices for learning SQL locally, with nearly identical core syntax.',
      'GUI clients (TablePlus, DBeaver, pgAdmin) and CLI tools (psql, mysql) are two equally valid ways to connect and run queries.',
      'Hosted free-tier services (Supabase, Neon, PlanetScale) are a no-install alternative that behaves like a real remote database.',
      'Creating a dedicated practice database, separate from any system database, keeps experimentation safe.',
    ],
  },
};

export const databaseDesignExtra = {
  'tools-for-database-design-erd-software': {
    title: 'Tools for Database Design (ERD Software)',
    intro: `An Entity-Relationship Diagram (ERD) is a visual map of a database's tables, their columns, and how they relate to each other — one-to-many, many-to-many, and so on — drawn before (or alongside) the actual CREATE TABLE statements. ERD software turns this diagramming process from a manual whiteboard sketch into a structured, often auto-generating tool that can keep the diagram and the real schema in sync.

Sketching a schema visually before writing SQL is not busywork — it is one of the cheapest ways to catch a design mistake, because fixing a wrong relationship or a missing foreign key on a diagram takes seconds, while fixing the same mistake after a table already has real data and dependent application code can take hours or days.`,
    sections: [
      {
        heading: 'What ERD Tools Actually Do',
        body: `At minimum, an ERD tool lets you draw boxes representing tables, list each table's columns and types inside the box, and draw lines between tables representing foreign key relationships, typically labeled with cardinality (one-to-one, one-to-many, many-to-many). More capable tools go further: they can generate working CREATE TABLE SQL directly from the diagram, or conversely reverse-engineer a diagram automatically from an existing database.`,
      },
      {
        heading: 'Common ERD Tools',
        body: `Different tools suit different workflows, from lightweight sketching to tools tied directly to a specific database engine.`,
        list: [
          '<strong>dbdiagram.io</strong> — a lightweight, code-based ERD tool where you describe tables and relationships in a simple text syntax (DBML) and it renders the diagram live; popular for quick, shareable schema sketches.',
          '<strong>draw.io (diagrams.net)</strong> — a free general-purpose diagramming tool with ERD shape templates; flexible but fully manual, with no SQL generation.',
          '<strong>pgAdmin\'s ERD view</strong> — built directly into pgAdmin for PostgreSQL; can generate a diagram from an existing database or design one and generate the SQL to create it.',
          '<strong>MySQL Workbench</strong> — MySQL\'s official design tool, with a full visual schema designer that can forward-engineer a diagram into a real database or reverse-engineer an existing one into a diagram.',
        ],
      },
      {
        heading: 'Why Diagramming First Catches Mistakes Early',
        body: `Drawing the schema surfaces problems that are much harder to spot while staring at a list of CREATE TABLE statements one at a time: a relationship that should be many-to-many but was modeled as one-to-many, a missing junction table, a column that logically belongs on a different table, or a table that is trying to do the job of two separate entities. Reviewing a diagram with a teammate takes minutes; reviewing raw SQL DDL for the same issues takes much longer and misses more.`,
      },
    ],
    examples: [
      {
        caption: 'A simple schema described in dbdiagram.io\'s DBML syntax',
        code: `Table students {
  id int [pk, increment]
  name varchar
  email varchar
}

Table courses {
  id int [pk, increment]
  title varchar
}

Table enrollments {
  id int [pk, increment]
  student_id int [ref: > students.id]
  course_id int [ref: > courses.id]
  enrolled_on date
}`,
        output: 'dbdiagram.io renders three connected boxes: "students" and "courses" each linked to a middle "enrollments" table via one-to-many relationship lines, visually confirming that this is a many-to-many relationship between students and courses implemented correctly through a junction table — a mistake that would be much easier to overlook reading three separate CREATE TABLE statements in a row.',
      },
    ],
    commonMistakes: [
      'Skipping the diagram entirely on a "small" project and writing CREATE TABLE statements directly, only to discover a many-to-many relationship was modeled incorrectly after data and application code already depend on the wrong structure.',
      'Letting the diagram and the real database schema drift out of sync over time by editing one without updating the other, which turns the diagram from a useful reference into a misleading one.',
      'Choosing a heavyweight, database-specific tool (like MySQL Workbench) for a purely conceptual sketching phase, when a fast text-based tool like dbdiagram.io would let you iterate on the design more quickly.',
      'Treating auto-generated CREATE TABLE SQL from an ERD tool as final without reviewing data types, constraints, and indexes, which the diagram usually represents only loosely.',
    ],
    keyPoints: [
      'ERD tools visually represent tables, columns, and relationships (including cardinality) before or alongside writing real SQL.',
      'dbdiagram.io, draw.io, pgAdmin\'s ERD view, and MySQL Workbench are common choices, ranging from lightweight sketching to full database-integrated design.',
      'Some tools can forward-generate SQL from a diagram or reverse-engineer a diagram from an existing database.',
      'Reviewing a visual diagram catches relationship and structural mistakes far earlier and more cheaply than catching the same mistakes after the schema is already in production.',
    ],
  },
};
