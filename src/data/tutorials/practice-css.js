// Practice blocks for the CSS course. Merged onto the lesson entries in index.js by slug,
// so the lesson prose files stay unchanged.
// The playground opens a CSS exercise in style.css next to a small page that contains a
// <main> element with an <h1>, a <p> and a <button>, so every exercise styles those four.
export const practiceCss = {
  'setting-up-a-css-workflow': {
    whyItMatters: `CSS does nothing until it is connected to a page, and a wrong path in the <code>link</code> element is the classic first bug: the page loads, unstyled, with no error on screen. Knowing how a stylesheet is linked, and how to try out changes live in DevTools before writing them down, is the routine you will repeat on every project.`,
    exercise: {
      prompt: `The playground page already links <code>style.css</code>. Write your first rules: give the page a sans-serif font, make the heading teal, and limit <code>main</code> to a width of 600px, centred on the page.

Expected result: the content sits in a centred column and the heading is teal.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: a sans-serif font for the whole page */

/* TODO: a teal heading */

/* TODO: main is at most 600px wide and centred */`,
      hints: [
        'Set the font on <code>body</code>; text inside inherits it.',
        'A block is centred horizontally with <code>margin: 0 auto</code> once it has a width or a <code>max-width</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

body {
  font-family: system-ui, sans-serif;
}

h1 {
  color: teal;
}

main {
  max-width: 600px;
  margin: 0 auto;
}`,
    },
    quiz: [
      {
        question: 'Which line correctly links an external stylesheet?',
        options: ['&lt;style src="style.css"&gt;', '&lt;link rel="stylesheet" href="style.css"&gt;', '&lt;css href="style.css"&gt;', '&lt;script href="style.css"&gt;'],
        answer: 1,
        explanation: 'The link element goes in the head, with rel="stylesheet" and the path in href.',
      },
      {
        question: 'You change a colour in the Styles pane of DevTools. What happens to your CSS file?',
        options: ['Nothing; the change lasts only until the page is reloaded', 'It is saved automatically', 'The file is deleted', 'The file is locked'],
        answer: 0,
        explanation: 'DevTools edits the page in memory. Copy the change into the file to keep it.',
      },
      {
        question: 'What does a preprocessor such as Sass produce?',
        options: ['JavaScript', 'A faster browser', 'HTML', 'Plain CSS that the browser can read'],
        answer: 3,
        explanation: 'Browsers do not understand Sass syntax; it is compiled to CSS before the page is served.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the three ways to add CSS to a page, and which is preferred?',
        answer: `An external stylesheet linked with a <code>link</code> element, an internal <code>style</code> element in the head, and inline <code>style</code> attributes on elements. External stylesheets are preferred: one file styles the whole site, the browser caches it, and content stays separate from presentation. Inline styles apply to a single element, cannot be reused and are hard to override.`,
      },
      {
        question: 'Do you still need Sass now that CSS has variables and nesting?',
        answer: `Much less than before. Native CSS now has custom properties, nesting, <code>calc()</code> and colour functions, which cover the most common reasons for using a preprocessor. Sass still offers mixins, functions, loops and file partials that are resolved at build time. Many new projects use plain CSS or a utility framework, while Sass remains common in existing codebases.`,
      },
    ],
  },

  'selectors': {
    whyItMatters: `A selector decides which elements a rule applies to, so every line of CSS you write starts with one. Choosing a selector that is too broad restyles things you did not intend, and one that is too narrow breaks as soon as the markup changes. Combinators and attribute selectors let you target elements precisely without adding a class to everything.`,
    exercise: {
      prompt: `Using only selectors (the page has no classes), make every paragraph inside <code>main</code> grey; make the paragraph that comes directly after the heading italic; and make a button that is a direct child of <code>main</code> bold.

Expected result: the paragraph is grey and italic, and the button text is bold.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: paragraphs anywhere inside main: grey */

/* TODO: the paragraph immediately after the h1: italic */

/* TODO: a button that is a direct child of main: bold */`,
      hints: [
        'A space selects descendants, <code>&gt;</code> selects direct children, and <code>+</code> selects the next sibling.',
        'The three selectors are <code>main p</code>, <code>h1 + p</code> and <code>main &gt; button</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main p {
  color: gray;
}

h1 + p {
  font-style: italic;
}

main > button {
  font-weight: bold;
}`,
    },
    quiz: [
      {
        question: 'What does the selector <code>.card p</code> match?',
        options: ['Only p elements that are direct children of .card', 'Every p element at any depth inside an element with the class card', 'Elements with both classes card and p', 'The first p on the page'],
        answer: 1,
        explanation: 'A space is the descendant combinator. Use > to limit the match to direct children.',
      },
      {
        question: 'Which selector matches inputs whose <code>type</code> is <code>email</code>?',
        options: ['input.email', 'input#email', 'input[type="email"]', 'input:email'],
        answer: 2,
        explanation: 'Square brackets select by attribute and value.',
      },
      {
        question: 'What does <code>h1, h2 { margin: 0; }</code> do?',
        options: ['Applies the rule to both h1 and h2 elements', 'Selects h2 inside h1', 'Selects an h2 that follows an h1', 'It is invalid'],
        answer: 0,
        explanation: 'A comma groups selectors so that they share one rule.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between the descendant, child and sibling combinators?',
        answer: `The descendant combinator, a space, matches an element at any depth inside another: <code>nav a</code>. The child combinator, <code>&gt;</code>, matches only direct children: <code>ul &gt; li</code>. The next-sibling combinator, <code>+</code>, matches the element immediately after another with the same parent: <code>h2 + p</code>. The subsequent-sibling combinator, <code>~</code>, matches all later siblings.`,
      },
      {
        question: 'What is the difference between a class selector and an id selector?',
        answer: `A class, written <code>.name</code>, can be used on any number of elements, and an element can have several classes; it is the normal tool for styling. An id, written <code>#name</code>, must be unique in the page and has much higher specificity, which makes rules based on it hard to override. Ids are therefore kept for fragment links, labels and JavaScript, and classes are used for styles.`,
      },
    ],
  },

  'cascade': {
    whyItMatters: `Several rules often set the same property on the same element, and the cascade is the set of rules that decides which one wins. Until you understand it, CSS feels random: a change has no effect, and nobody knows why. Once you do, you can predict the result and stop reaching for <code>!important</code>.`,
    exercise: {
      prompt: `Set the text colour once on <code>main</code> so that the heading and the paragraph both inherit navy. Then override the paragraph alone to grey with a later rule. Finally, make the button use the inherited colour too; form controls do not inherit text colour by default.

Expected result: a navy heading, a grey paragraph and navy button text.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: navy text for everything inside main */

/* TODO: the paragraph is grey instead */

/* TODO: the button takes the colour of its parent */`,
      hints: [
        '<code>color</code> is an inherited property, so setting it on <code>main</code> reaches its children.',
        'The keyword <code>inherit</code> forces a property to take its parent\'s value: <code>color: inherit</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  color: navy;
}

p {
  color: gray;
}

button {
  color: inherit;
}`,
    },
    quiz: [
      {
        question: 'Two rules with the same selector set different colours on the same element. Which wins?',
        options: ['The first one in the file', 'Neither', 'The one that appears later', 'The shorter one'],
        answer: 2,
        explanation: 'When origin, importance and specificity are equal, source order decides.',
      },
      {
        question: 'Which of these properties is inherited by child elements by default?',
        options: ['color', 'border', 'margin', 'padding'],
        answer: 0,
        explanation: 'Text properties such as color and font-family inherit. Box properties such as margin and border do not.',
      },
      {
        question: 'Why should <code>!important</code> be avoided in ordinary code?',
        options: ['It is not supported by browsers', 'It slows the page down', 'It only works on colours', 'It overrides normal cascade rules, so the only way to beat it is another !important'],
        answer: 3,
        explanation: 'It leads to an escalating series of overrides that is hard to maintain.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does the cascade decide which declaration applies?',
        answer: `It compares competing declarations in order. First by origin and importance: browser defaults, then user styles, then author styles, with <code>!important</code> reversing that order. Then by specificity of the selector. Then by source order, the later declaration winning. Cascade layers, declared with <code>@layer</code>, add a step between origin and specificity. If no declaration applies at all, the property is inherited or takes its initial value.`,
      },
      {
        question: 'What is the difference between the cascade and inheritance?',
        answer: `The cascade resolves a conflict between several declarations that target the same element. Inheritance is what happens when no declaration targets the element for a property: certain properties, mostly those to do with text, take the value computed for the parent. A declaration that targets the element directly always beats an inherited value, however low its specificity.`,
      },
    ],
  },

  'specificity': {
    whyItMatters: `When a style refuses to apply, the cause is nearly always specificity: another selector outweighs yours. Being able to calculate which of two selectors wins turns hours of trial and error into a quick look. It is also one of the most reliably asked CSS interview questions.`,
    exercise: {
      prompt: `The second rule comes later, but the paragraph is still red, because the first selector is more specific. Without using <code>!important</code> and without changing or moving the first rule, change the selector of the second rule so that it wins and the paragraph turns green.

Expected result: the paragraph is green.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main p {
  color: red;
}

p {
  color: green;
}`,
      hints: [
        '<code>main p</code> has two element selectors; <code>p</code> has one.',
        'A selector with three element selectors, such as <code>body main p</code>, is more specific than one with two.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main p {
  color: red;
}

body main p {
  color: green;
}`,
    },
    quiz: [
      {
        question: 'Which selector has the highest specificity?',
        options: ['p', '.note', 'div p', '#intro'],
        answer: 3,
        explanation: 'One id outweighs any number of classes, and one class outweighs any number of element selectors.',
      },
      {
        question: 'What is the specificity of <code>ul li.active a</code>, written as ids, classes, elements?',
        options: ['0, 1, 3', '0, 3, 1', '1, 1, 2', '0, 1, 1'],
        answer: 0,
        explanation: 'There is one class (.active) and three element selectors (ul, li, a).',
      },
      {
        question: 'Two selectors have exactly the same specificity. What decides the winner?',
        options: ['The longer selector', 'The one that comes later in the source', 'The one written first', 'Alphabetical order'],
        answer: 1,
        explanation: 'Source order is the tie-breaker.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How is specificity calculated?',
        answer: `Count three groups. The number of id selectors; the number of class selectors, attribute selectors and pseudo-classes; and the number of element selectors and pseudo-elements. Compare the groups from left to right: the first difference decides, so one id beats any number of classes. The universal selector and combinators add nothing. An inline <code>style</code> attribute outranks all selectors, and <code>!important</code> overrides the normal comparison.`,
      },
      {
        question: 'How do you keep specificity under control in a large project?',
        answer: `Style with single classes and keep selectors flat, so that almost every rule has the same low specificity and source order decides. Avoid ids and long chains of nested selectors in stylesheets. A naming convention such as BEM, component-scoped styles, or cascade layers with <code>@layer</code> all support this. <code>:where()</code> can wrap a selector to give it zero specificity, which is useful for defaults that should be easy to override.`,
      },
    ],
  },

  'box-model': {
    whyItMatters: `Every element on a page is a rectangular box made of content, padding, border and margin. Layout bugs such as an element that is wider than you set, or two columns that will not fit side by side, come from not accounting for those layers. The <code>box-sizing</code> rule in this lesson is at the top of almost every professional stylesheet.`,
    exercise: {
      prompt: `Give the button a width of 200px, padding of 20px and a 5px solid border, and make sure its total rendered width is still exactly 200px. Then put 30px of space above it.

Expected result: a button that measures exactly 200px wide in DevTools, sitting 30px below the paragraph.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

button {
  /* TODO: width, padding and border */
  /* TODO: make the width include the padding and border */
  /* TODO: space above the button */
}`,
      hints: [
        'With the default <code>content-box</code>, the width would be 200 + 40 + 10 = 250px.',
        '<code>box-sizing: border-box</code> makes <code>width</code> include the padding and border.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

button {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  box-sizing: border-box;
  margin-top: 30px;
}`,
    },
    quiz: [
      {
        question: 'In what order do the layers of the box model go, from the inside out?',
        options: ['Margin, border, padding, content', 'Content, border, padding, margin', 'Content, padding, border, margin', 'Padding, content, margin, border'],
        answer: 2,
        explanation: 'Padding is inside the border and margin is outside it.',
      },
      {
        question: 'An element has <code>width: 100px; padding: 10px; border: 2px solid;</code> and the default <code>box-sizing</code>. How wide is it on screen?',
        options: ['100px', '124px', '112px', '120px'],
        answer: 1,
        explanation: 'With content-box, padding and border on both sides are added: 100 + 20 + 4.',
      },
      {
        question: 'Two paragraphs are stacked. The first has <code>margin-bottom: 30px</code> and the second <code>margin-top: 20px</code>. What is the gap between them?',
        options: ['30px', '50px', '20px', '10px'],
        answer: 0,
        explanation: 'Adjoining vertical margins collapse into one, equal to the larger of the two.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between content-box and border-box?',
        answer: `With <code>box-sizing: content-box</code>, the default, <code>width</code> and <code>height</code> set the size of the content area only, and padding and border are added on top, so the element ends up larger than the stated width. With <code>border-box</code>, the stated width includes padding and border, and the content area shrinks to fit. Most projects apply <code>border-box</code> to every element because it makes sizes predictable.`,
      },
      {
        question: 'What is margin collapsing?',
        answer: `When the vertical margins of two block elements touch, they combine into a single margin whose size is the larger of the two, not their sum. It happens between adjacent siblings and between a parent and its first or last child when no padding, border or content separates them. It does not happen to horizontal margins, or to the items of a flex or grid container.`,
      },
    ],
  },

  'units': {
    whyItMatters: `A layout built in fixed pixels looks right on one screen and wrong on most others, and ignores users who have set a larger default text size. Relative units make a design scale. Choosing between <code>px</code>, <code>rem</code>, <code>em</code>, percentages and viewport units is a decision you make on almost every declaration.`,
    exercise: {
      prompt: `Size everything with relative units: the heading at twice the root font size; the paragraph at 1.125 times the root font size; <code>main</code> at 90% of the width of its parent but never wider than 40rem; and button padding that scales with the button's own font size, 0.75 of it vertically and 1.5 of it horizontally.

Expected result: the layout keeps its proportions when the browser's default font size is changed.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: h1 font size relative to the root */

/* TODO: p font size relative to the root */

/* TODO: main width as a percentage, with a maximum in rem */

/* TODO: button padding relative to its own font size */`,
      hints: [
        '<code>rem</code> is relative to the font size of the root element, and <code>em</code> to the font size of the element itself.',
        'Padding with two values is written vertical then horizontal: <code>padding: 0.75em 1.5em</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

h1 {
  font-size: 2rem;
}

p {
  font-size: 1.125rem;
}

main {
  width: 90%;
  max-width: 40rem;
}

button {
  padding: 0.75em 1.5em;
}`,
    },
    quiz: [
      {
        question: 'What is <code>1rem</code> equal to?',
        options: ['The font size of the parent element', 'Always 10px', '1% of the viewport width', 'The font size of the root (html) element'],
        answer: 3,
        explanation: 'By default that is 16px, unless the user or the stylesheet changes it.',
      },
      {
        question: 'A <code>div</code> with <code>font-size: 1.5em</code> is nested inside another <code>div</code> with the same rule, and the root size is 16px. What is the inner font size?',
        options: ['24px', '36px', '16px', '48px'],
        answer: 1,
        explanation: 'em is relative to the parent\'s font size, so it compounds: 16 × 1.5 × 1.5.',
      },
      {
        question: 'What does <code>50vw</code> mean?',
        options: ['Half the width of the viewport', '50 pixels', 'Half the width of the parent element', 'Half the font size'],
        answer: 0,
        explanation: 'One vw is 1% of the viewport width. A percentage, by contrast, is relative to the parent.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between em and rem?',
        answer: `<code>rem</code> is always relative to the font size of the root element, so 1rem means the same everywhere on the page. <code>em</code> is relative to the font size of the element itself, or of its parent when used for <code>font-size</code>, so nested elements compound. <code>rem</code> is the usual choice for font sizes and spacing; <code>em</code> is useful when something should scale with the text of its own component, such as button padding.`,
      },
      {
        question: 'Why use rem instead of px for font sizes?',
        answer: `Users can change the default font size of their browser, and many people with low vision do. Sizes in <code>rem</code> scale with that setting, while sizes in <code>px</code> ignore it. Using <code>rem</code> for type and for spacing related to type therefore respects the user's preference and makes the whole layout scale consistently. Pixels remain fine for things that should not scale, such as a 1px border.`,
      },
    ],
  },

  'typography': {
    whyItMatters: `Most of a web page is text, and the difference between an amateur page and a professional one is largely type: a readable size, comfortable line spacing and lines that are not too long. These few properties cost nothing and improve every page you make.`,
    exercise: {
      prompt: `Set readable body text: a system font stack with a generic fallback, a line height of 1.6, and paragraphs no wider than 65 characters. Make the heading bold at weight 700 with letter spacing tightened by 0.02em.

Expected result: comfortable, evenly spaced text with a slightly tightened heading.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

body {
  /* TODO: font stack and line height */
}

p {
  /* TODO: limit the line length */
}

h1 {
  /* TODO: weight and letter spacing */
}`,
      hints: [
        'A font stack lists fonts in order of preference and ends with a generic family such as <code>sans-serif</code>.',
        'The <code>ch</code> unit is about the width of one character, so <code>max-width: 65ch</code> limits the line length.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
}

p {
  max-width: 65ch;
}

h1 {
  font-weight: 700;
  letter-spacing: -0.02em;
}`,
    },
    quiz: [
      {
        question: 'Why does a font stack end with a generic family such as <code>sans-serif</code>?',
        options: ['It is required by the syntax', 'It makes the text bold', 'It guarantees a fallback if none of the named fonts is available', 'It loads the font faster'],
        answer: 2,
        explanation: 'The browser works through the list and uses the first font it has.',
      },
      {
        question: 'Why is a unitless <code>line-height</code>, such as <code>1.5</code>, recommended?',
        options: ['It is multiplied by each element\'s own font size, so it scales correctly when inherited', 'It is shorter to type', 'Units are not allowed', 'It disables inheritance'],
        answer: 0,
        explanation: 'A value with a unit is computed once and inherited as a fixed length, which can be too small for larger text.',
      },
      {
        question: 'Which rule loads a custom font file?',
        options: ['@import-font', '@font', '@typeface', '@font-face'],
        answer: 3,
        explanation: 'It names a font family and points to the font file with src.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What makes body text readable?',
        answer: `A font size of at least 16px for body text; a line height of roughly 1.5 to 1.6; a line length of about 45 to 75 characters, which <code>max-width</code> in <code>ch</code> enforces; strong contrast between text and background; and left-aligned text for long passages. Enough space between paragraphs and a clear difference between heading levels complete it.`,
      },
      {
        question: 'What does font-display: swap do?',
        answer: `It is a descriptor in an <code>@font-face</code> rule that controls what happens while a web font is downloading. With <code>swap</code>, the browser shows the text straight away in a fallback font and switches to the web font when it arrives. This avoids invisible text during loading, at the cost of a visible change of font; choosing a fallback of similar proportions reduces that shift.`,
      },
    ],
  },

  'positioning': {
    whyItMatters: `Badges on icons, dropdown menus, modals, sticky headers and tooltips all depend on the <code>position</code> property. Most confusion comes from one rule: an absolutely positioned element is placed relative to its nearest positioned ancestor. Once that is clear, positioning stops being trial and error.`,
    exercise: {
      prompt: `Place the button in the top-right corner of <code>main</code>, 10px from the top and 10px from the right. It must be positioned relative to <code>main</code>, not to the whole page. Give <code>main</code> a border and some padding so that the corner is visible.

Expected result: the button sits in the top-right corner inside the bordered box.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  border: 2px solid gray;
  padding: 20px;
  /* TODO: make main the reference for its positioned children */
}

button {
  /* TODO: take the button out of the flow and place it in the corner */
}`,
      hints: [
        'An absolutely positioned element looks for the nearest ancestor whose <code>position</code> is not <code>static</code>.',
        '<code>position: relative</code> on <code>main</code>, with no offsets, makes it that ancestor without moving it.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  border: 2px solid gray;
  padding: 20px;
  position: relative;
}

button {
  position: absolute;
  top: 10px;
  right: 10px;
}`,
    },
    quiz: [
      {
        question: 'What is the default value of <code>position</code>?',
        options: ['relative', 'static', 'absolute', 'fixed'],
        answer: 1,
        explanation: 'A static element is in the normal flow, and top, right, bottom and left have no effect on it.',
      },
      {
        question: 'What is a <code>position: fixed</code> element positioned relative to?',
        options: ['Its parent', 'The previous element', 'The viewport', 'The document'],
        answer: 2,
        explanation: 'It stays in the same place on screen when the page scrolls.',
      },
      {
        question: 'What happens to the space of an element with <code>position: relative; top: 20px</code>?',
        options: ['Its original space in the flow is kept, and it is drawn 20px lower', 'The space is removed', 'Other elements move down by 20px', 'It leaves the flow completely'],
        answer: 0,
        explanation: 'A relatively positioned element is shifted visually without affecting its neighbours.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain the values of the position property.',
        answer: `<code>static</code> is the default: the element is in the normal flow. <code>relative</code> keeps the element's place in the flow and offsets it from that place. <code>absolute</code> removes it from the flow and positions it relative to the nearest positioned ancestor. <code>fixed</code> removes it from the flow and positions it relative to the viewport. <code>sticky</code> behaves as relative until the element reaches a scroll threshold such as <code>top: 0</code>, then stays there while its container is in view.`,
      },
      {
        question: 'Why might z-index not work?',
        answer: `<code>z-index</code> only applies to positioned elements, meaning those with a <code>position</code> other than <code>static</code>, and to flex and grid items. It also works only within a stacking context: an element cannot rise above something outside its own stacking context, whatever its value. Properties such as <code>opacity</code> below 1, <code>transform</code> and <code>position: fixed</code> create a new stacking context, which is the usual cause of the surprise.`,
      },
    ],
  },

  'display': {
    whyItMatters: `The <code>display</code> property decides how an element takes part in layout: whether it starts a new line, whether it accepts a width, and whether it is shown at all. Width and margin that seem to be ignored are usually a sign that the element is inline. It is the property underneath every layout technique that follows.`,
    exercise: {
      prompt: `Give the heading a yellow background and make it only as wide as its text while still accepting padding. Make the button stretch to the full width of its container. Hide the paragraph in a way that keeps its empty space on the page.

Expected result: a yellow box hugging the heading text, an empty gap where the paragraph was, and a full-width button.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

h1 {
  background: yellow;
  padding: 10px;
  /* TODO: shrink to the width of the text */
}

p {
  /* TODO: invisible, but still taking up space */
}

button {
  /* TODO: full width */
}`,
      hints: [
        '<code>inline-block</code> shrinks to its content like an inline element but accepts padding, width and height like a block.',
        '<code>visibility: hidden</code> hides an element and keeps its space; <code>display: none</code> removes it from the layout.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

h1 {
  background: yellow;
  padding: 10px;
  display: inline-block;
}

p {
  visibility: hidden;
}

button {
  display: block;
  width: 100%;
}`,
    },
    quiz: [
      {
        question: 'Which statement about an inline element, such as <code>span</code>, is true?',
        options: ['It always starts on a new line', 'It fills the full width available', 'It cannot contain text', 'width and height have no effect on it'],
        answer: 3,
        explanation: 'An inline element is sized by its content and flows within a line of text.',
      },
      {
        question: 'What is the difference between <code>display: none</code> and <code>visibility: hidden</code>?',
        options: ['There is none', 'display: none removes the element from the layout; visibility: hidden hides it but keeps its space', 'visibility: hidden removes the element from the layout', 'display: none only hides the text'],
        answer: 1,
        explanation: 'Both also hide the element from screen readers.',
      },
      {
        question: 'Which is a block-level element by default?',
        options: ['div', 'span', 'a', 'img'],
        answer: 0,
        explanation: 'A div starts on a new line and takes the full width available.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between block, inline and inline-block?',
        answer: `A block element starts on a new line, takes the full width available, and respects width, height and all margins. An inline element flows within a line of text, is as wide as its content, and ignores width, height and vertical margins. An inline-block element flows inline like text but is treated as a block inside, so it accepts width, height, padding and margins on every side.`,
      },
      {
        question: 'What are the ways to hide an element, and how do they differ?',
        answer: `<code>display: none</code> removes the element from the layout and from the accessibility tree. <code>visibility: hidden</code> hides it and removes it from the accessibility tree but keeps its space. <code>opacity: 0</code> makes it transparent while it still occupies space, can be clicked and is read by screen readers. To hide something visually while keeping it available to screen readers, a "visually hidden" utility class that clips the element to one pixel is used.`,
      },
    ],
  },

  'flexbox': {
    whyItMatters: `Flexbox made the layouts that used to need hacks straightforward: a row of items with space between them, vertical centring, columns of equal height. Navigation bars, toolbars, cards and form rows are almost always flex containers. It is the layout tool you will use most often.`,
    exercise: {
      prompt: `Turn <code>main</code> into a flex container so that the heading, the paragraph and the button sit in one row, centred vertically, with 16px between them, and with the button pushed to the far right.

Expected result: heading and paragraph on the left, the button at the right edge, all aligned on their vertical centres.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  /* TODO: a flex row, centred vertically, with a 16px gap */
}

button {
  /* TODO: push the button to the far right */
}`,
      hints: [
        '<code>align-items: center</code> centres the items on the cross axis, which is vertical in a row.',
        'An automatic margin absorbs the free space: <code>margin-left: auto</code> pushes an item to the right.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  display: flex;
  align-items: center;
  gap: 16px;
}

button {
  margin-left: auto;
}`,
    },
    quiz: [
      {
        question: 'In a flex container with the default direction, which property aligns the items horizontally?',
        options: ['align-items', 'align-content', 'justify-content', 'flex-direction'],
        answer: 2,
        explanation: 'justify-content works along the main axis, which is horizontal for a row. align-items works on the cross axis.',
      },
      {
        question: 'What does <code>flex: 1</code> on every item of a row do?',
        options: ['The items share the available space equally', 'Each item is 1px wide', 'Only the first item grows', 'The items wrap onto new lines'],
        answer: 0,
        explanation: 'It is shorthand for flex-grow 1, flex-shrink 1 and flex-basis 0.',
      },
      {
        question: 'By default, what happens when the items of a flex row do not fit?',
        options: ['They wrap onto a new line', 'They are hidden', 'The container scrolls', 'They shrink to fit on one line, because flex-wrap defaults to nowrap'],
        answer: 3,
        explanation: 'Set flex-wrap: wrap to allow the items to move onto new lines.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main axis and the cross axis?',
        answer: `The main axis is the direction in which the flex items are laid out, set by <code>flex-direction</code>: horizontal for <code>row</code>, vertical for <code>column</code>. The cross axis is perpendicular to it. <code>justify-content</code> distributes items along the main axis, and <code>align-items</code> aligns them along the cross axis. When the direction changes to column, the two properties swap the directions they affect.`,
      },
      {
        question: 'How do you centre an element both horizontally and vertically?',
        answer: `Make its parent a flex container and centre on both axes: <code>display: flex; justify-content: center; align-items: center;</code>, giving the parent a height to centre within. With grid it is shorter still: <code>display: grid; place-items: center;</code>. Both work whatever the size of the child.`,
      },
    ],
  },

  'grid': {
    whyItMatters: `Grid is the first CSS layout system designed for two dimensions: rows and columns together. Page layouts, image galleries and dashboards that needed frameworks or nested wrappers are a few lines of grid. Knowing when to use grid and when flexbox is one of the questions interviewers ask most.`,
    exercise: {
      prompt: `Make <code>main</code> a grid with two columns, the second twice as wide as the first, and a 16px gap. The heading should stretch across both columns, with the paragraph and the button side by side beneath it.

Expected result: a full-width heading, and under it the paragraph in a narrow column and the button in a wide one.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  /* TODO: a two-column grid, 1 part and 2 parts, with a 16px gap */
}

h1 {
  /* TODO: span every column */
}`,
      hints: [
        'The <code>fr</code> unit shares out the free space: <code>grid-template-columns: 1fr 2fr</code>.',
        '<code>grid-column: 1 / -1</code> stretches an item from the first grid line to the last.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
}

h1 {
  grid-column: 1 / -1;
}`,
    },
    quiz: [
      {
        question: 'What does the <code>fr</code> unit represent?',
        options: ['A fixed number of pixels', 'A fraction of the free space in the grid container', 'The font size of the root', 'A frame of animation'],
        answer: 1,
        explanation: 'Columns of 1fr and 2fr share the free space in the ratio one to two.',
      },
      {
        question: 'What does <code>grid-template-columns: repeat(3, 1fr)</code> create?',
        options: ['Three equal columns', 'Three rows', 'One column repeated in three grids', 'Three columns of 1px'],
        answer: 0,
        explanation: 'repeat avoids writing 1fr 1fr 1fr.',
      },
      {
        question: 'What is <code>repeat(auto-fit, minmax(200px, 1fr))</code> used for?',
        options: ['A fixed layout of 200 columns', 'Animating a grid', 'A responsive grid that fits as many columns of at least 200px as the width allows', 'Hiding empty cells'],
        answer: 2,
        explanation: 'The number of columns changes with the available width, with no media query.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you use grid and when flexbox?',
        answer: `Flexbox lays items out along one axis, a row or a column, and lets their content decide their size; it suits navigation bars, toolbars and the alignment of items inside a component. Grid controls rows and columns together from the container, so it suits page layouts and anything where items must line up in both directions. They are often combined: grid for the overall page, flexbox inside the pieces.`,
      },
      {
        question: 'What is the difference between auto-fit and auto-fill?',
        answer: `Both create as many columns as fit in the container. They differ when there are fewer items than columns. <code>auto-fill</code> keeps the empty columns, so the items stay at their minimum width with empty space beside them. <code>auto-fit</code> collapses the empty columns to zero, so the existing items stretch to fill the row.`,
      },
    ],
  },

  'responsive-design': {
    whyItMatters: `More than half of web traffic comes from phones, and Google ranks pages by their mobile version. A site that only works at desktop width loses most of its audience. Responsive design is not an extra feature; it is the default expectation for every page.`,
    exercise: {
      prompt: `Write mobile-friendly base styles: <code>main</code> takes 90% of the width but never more than 40rem and is centred; images never overflow their container and keep their proportions; and the button fills the full width so that it is easy to tap.

Expected result: on a narrow preview the content fills the width with a margin either side; on a wide one it stops growing at 40rem and stays centred.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  /* TODO: fluid width with a maximum, centred */
}

img {
  /* TODO: never wider than the container; keep proportions */
}

button {
  /* TODO: full width with comfortable padding */
}`,
      hints: [
        'Combine a percentage <code>width</code> with a <code>max-width</code>, and centre with <code>margin: 0 auto</code>.',
        'The standard rule for fluid images is <code>max-width: 100%; height: auto;</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  width: 90%;
  max-width: 40rem;
  margin: 0 auto;
}

img {
  max-width: 100%;
  height: auto;
}

button {
  display: block;
  width: 100%;
  padding: 0.75rem;
}`,
    },
    quiz: [
      {
        question: 'What does "mobile-first" mean in CSS?',
        options: ['Building a separate mobile site', 'Hiding content on phones', 'Using only pixel units', 'Writing the base styles for small screens and adding rules for larger ones with min-width queries'],
        answer: 3,
        explanation: 'Larger screens then build on the simpler small-screen layout.',
      },
      {
        question: 'Which rule stops an image from overflowing a narrow container?',
        options: ['width: 100vw', 'max-width: 100%', 'overflow: visible', 'position: fixed'],
        answer: 1,
        explanation: 'With height: auto alongside it, the image shrinks in proportion.',
      },
      {
        question: 'Which HTML tag must be present for responsive CSS to work on phones?',
        options: ['The viewport meta tag', 'The charset meta tag', 'A link to a mobile stylesheet', 'The canonical link'],
        answer: 0,
        explanation: 'Without it, a phone lays the page out at desktop width and scales it down.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the building blocks of responsive design?',
        answer: `The viewport meta tag, so the page uses the real width of the device. Fluid layouts, sized in percentages, <code>fr</code> and <code>rem</code> instead of fixed pixels, and built with flexbox and grid. Flexible images and media that scale with their container. Media queries, and now container queries, that change the layout at the widths where it starts to look wrong.`,
      },
      {
        question: 'How do you choose breakpoints?',
        answer: `From the content, not from particular devices. Start with the narrowest layout, widen the window, and add a breakpoint where the design begins to look stretched or cramped, for example where lines become too long or there is room for a second column. Device sizes change constantly, so breakpoints tied to specific phones date quickly. A handful of breakpoints is usually enough.`,
      },
    ],
  },

  'media-queries': {
    whyItMatters: `Media queries apply styles only when a condition holds, such as the window being at least a certain width. They are how one stylesheet serves a phone and a wide monitor. They also respond to the user's preferences, such as dark mode and reduced motion.`,
    exercise: {
      prompt: `Write the layout mobile-first. By default the three elements in <code>main</code> stack in a column with a 12px gap. From a viewport width of 600px upwards, they sit in a row, centred vertically.

Expected result: a stacked layout in a narrow preview, switching to a single row when the preview is at least 600px wide.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  /* TODO: a flex column with a 12px gap */
}

/* TODO: from 600px wide, switch to a row, centred vertically */`,
      hints: [
        'The query is written <code>@media (min-width: 600px) { ... }</code>.',
        'Inside it, only the properties that change are repeated: <code>flex-direction</code> and <code>align-items</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 600px) {
  main {
    flex-direction: row;
    align-items: center;
  }
}`,
    },
    quiz: [
      {
        question: 'When do the styles inside <code>@media (min-width: 768px)</code> apply?',
        options: ['When the viewport is 768px wide or wider', 'When the viewport is narrower than 768px', 'Only at exactly 768px', 'Only when printing'],
        answer: 0,
        explanation: 'min-width means "at least this wide".',
      },
      {
        question: 'Which query type goes with a mobile-first approach?',
        options: ['max-width', 'orientation', 'min-width', 'print'],
        answer: 2,
        explanation: 'The base styles serve small screens, and each min-width query adds rules for larger ones.',
      },
      {
        question: 'Which media feature detects that the user has asked for a dark theme?',
        options: ['color-mode', 'prefers-color-scheme', 'theme', 'display-mode'],
        answer: 1,
        explanation: '@media (prefers-color-scheme: dark) applies when the operating system is set to dark.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between min-width and max-width media queries?',
        answer: `A <code>min-width</code> query applies from the given width upwards and is used mobile-first: the base CSS is the small-screen layout and each query adds to it. A <code>max-width</code> query applies up to the given width and is used desktop-first: the base CSS is the large layout and queries undo or simplify it. Mobile-first usually gives simpler CSS, because small-screen layouts need fewer rules.`,
      },
      {
        question: 'Besides width, what can media queries detect?',
        answer: `The orientation of the screen; whether the output is a screen or print; the resolution, for high-density displays; whether the primary input can hover, with <code>hover</code> and <code>pointer</code>; and user preferences such as <code>prefers-color-scheme</code>, <code>prefers-reduced-motion</code> and <code>prefers-contrast</code>. Conditions are combined with <code>and</code>, and listed as alternatives with commas.`,
      },
    ],
  },

  'variables': {
    whyItMatters: `A brand colour used in fifty places should be defined once. CSS custom properties make that possible without a build tool, and because they are live in the browser they can be changed at runtime, which is how most dark-mode switches work. Design systems are built on them.`,
    exercise: {
      prompt: `Define two custom properties on the root: a brand colour of <code>#0f766e</code> and a spacing value of <code>1rem</code>. Use the brand colour for the heading text and the button background, and the spacing value for the padding of <code>main</code>. Give the button white text.

Expected result: a teal heading, a teal button with white text, and padding around the content.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

:root {
  /* TODO: --brand and --space */
}

/* TODO: use the variables on h1, button and main */`,
      hints: [
        'A custom property name starts with two hyphens: <code>--brand: #0f766e;</code>.',
        'It is read with <code>var(--brand)</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

:root {
  --brand: #0f766e;
  --space: 1rem;
}

h1 {
  color: var(--brand);
}

button {
  background: var(--brand);
  color: white;
}

main {
  padding: var(--space);
}`,
    },
    quiz: [
      {
        question: 'How is a CSS custom property declared?',
        options: ['$brand: blue;', '@brand: blue;', 'var brand = blue;', '--brand: blue;'],
        answer: 3,
        explanation: 'The $ and @ forms belong to the Sass and Less preprocessors.',
      },
      {
        question: 'What does <code>var(--gap, 8px)</code> do?',
        options: ['Sets --gap to 8px', 'Uses the value of --gap, or 8px if --gap is not defined', 'Adds 8px to --gap', 'It is invalid'],
        answer: 1,
        explanation: 'The second argument is a fallback value.',
      },
      {
        question: 'Why are custom properties usually declared on <code>:root</code>?',
        options: ['They are inherited, so declaring them on the root makes them available to every element', 'It is the only place they are allowed', 'It makes them faster', 'It makes them constant'],
        answer: 0,
        explanation: 'Declaring one on a narrower selector scopes it to that element and its descendants.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between CSS custom properties and Sass variables?',
        answer: `A Sass variable is replaced by its value when the stylesheet is compiled, so it does not exist in the browser. A CSS custom property exists at runtime: it takes part in the cascade, is inherited, can be given a different value inside a selector or a media query, and can be read and changed with JavaScript. Custom properties therefore support live theming, which Sass variables cannot.`,
      },
      {
        question: 'How would you implement a dark theme with custom properties?',
        answer: `Define the colours as custom properties on <code>:root</code>, such as <code>--bg</code> and <code>--text</code>, and use only those variables in the component styles. Then redefine the same properties for the dark theme, either inside <code>@media (prefers-color-scheme: dark)</code> to follow the system setting, or under a selector such as <code>[data-theme="dark"]</code> that a toggle button sets. No component rule has to change.`,
      },
    ],
  },

  'transitions': {
    whyItMatters: `Without a transition, a style change on hover is instant and feels abrupt. A fraction of a second of smooth change makes an interface feel responsive and shows the user what happened. Transitions are the simplest form of animation in CSS and the one you will use on almost every interactive element.`,
    exercise: {
      prompt: `Give the button a blue background and white text. On hover, the background becomes dark blue and the button grows slightly. Both changes should take 0.3 seconds with an ease timing.

Expected result: moving the pointer over the button darkens and enlarges it smoothly, and it returns smoothly when the pointer leaves.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

button {
  background-color: royalblue;
  color: white;
  /* TODO: transition for background-color and transform */
}

button:hover {
  /* TODO: darker background, slightly larger */
}`,
      hints: [
        'The transition goes on the element itself, not on the <code>:hover</code> rule, so that it runs in both directions.',
        'Several properties are separated by commas: <code>transition: background-color 0.3s ease, transform 0.3s ease</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

button {
  background-color: royalblue;
  color: white;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

button:hover {
  background-color: darkblue;
  transform: scale(1.05);
}`,
    },
    quiz: [
      {
        question: 'In <code>transition: opacity 0.5s ease-in 0.2s</code>, what does <code>0.2s</code> mean?',
        options: ['The duration', 'The number of repeats', 'The delay before the transition starts', 'The opacity value'],
        answer: 2,
        explanation: 'The first time value is the duration and the second is the delay.',
      },
      {
        question: 'On which rule should the <code>transition</code> property be placed?',
        options: ['The base rule of the element, so that it animates both to and from the changed state', 'Only the :hover rule', 'The body', 'A media query'],
        answer: 0,
        explanation: 'On :hover alone, the change back would be instant.',
      },
      {
        question: 'Which of these changes cannot be transitioned smoothly?',
        options: ['opacity from 0 to 1', 'A background colour', 'transform: scale(1) to scale(1.2)', 'display from none to block'],
        answer: 3,
        explanation: 'display has no intermediate values. Fade with opacity or visibility instead.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a transition and an animation?',
        answer: `A transition animates a property between two states and needs a trigger, such as a hover or a class being added. An animation uses <code>@keyframes</code> to define any number of steps, can start by itself when the page loads, and can loop, alternate and pause. Transitions suit simple reactions to interaction; animations suit multi-step or continuous motion.`,
      },
      {
        question: 'Which properties are best to animate for performance?',
        answer: `<code>transform</code> and <code>opacity</code>. The browser can apply changes to these on the compositor without recalculating the layout or repainting, so they stay smooth. Animating properties such as <code>width</code>, <code>height</code>, <code>top</code> or <code>margin</code> forces the layout to be recalculated on every frame, which can stutter. Moving an element with <code>translate</code> is therefore preferred to changing its position.`,
      },
    ],
  },

  'transforms': {
    whyItMatters: `Transforms move, rotate, scale and skew an element without disturbing the layout around it. They are behind hover effects, sliding menus, spinning loaders and the classic centring trick. Because the browser handles them cheaply, they are also the right way to animate movement.`,
    exercise: {
      prompt: `Tilt the heading by 2 degrees anticlockwise, rotating around its left edge. When the button is hovered, lift it 4px and enlarge it by 5%.

Expected result: a slightly tilted heading, and a button that rises and grows under the pointer while the paragraph above it stays still.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

h1 {
  /* TODO: rotate -2 degrees around the left edge */
}

button:hover {
  /* TODO: move up 4px and scale to 105% */
}`,
      hints: [
        'The point an element rotates around is set with <code>transform-origin</code>, for example <code>left center</code>.',
        'Several functions go in one declaration, separated by spaces: <code>transform: translateY(-4px) scale(1.05)</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

h1 {
  transform: rotate(-2deg);
  transform-origin: left center;
}

button:hover {
  transform: translateY(-4px) scale(1.05);
}`,
    },
    quiz: [
      {
        question: 'Does <code>transform: translateX(100px)</code> move the neighbouring elements?',
        options: ['Yes, they shift by 100px', 'No; the element is drawn in a new place, but the layout keeps its original space', 'Only elements to the right', 'Only in a flex container'],
        answer: 1,
        explanation: 'Transforms happen after layout, so nothing else is affected.',
      },
      {
        question: 'What is the default <code>transform-origin</code>?',
        options: ['The top-left corner', 'The bottom-right corner', 'The centre of the element', 'The centre of the page'],
        answer: 2,
        explanation: 'Rotation and scaling happen around the centre unless the origin is changed.',
      },
      {
        question: 'An element has two rules, each setting <code>transform</code>. What happens?',
        options: ['The declaration that wins the cascade replaces the other; they are not combined', 'Both transforms are applied', 'Neither is applied', 'An error is raised'],
        answer: 0,
        explanation: 'All the functions needed must be listed together in one transform value.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why are transforms good for animation?',
        answer: `A transform does not change the layout: the element keeps its original space and nothing around it moves. The browser can therefore skip layout and paint and apply the change on the compositor, often on the GPU, which keeps the animation at a steady frame rate. Changing <code>top</code>, <code>left</code>, <code>width</code> or <code>margin</code> to get the same visual effect triggers layout on every frame.`,
      },
      {
        question: 'Does the order of transform functions matter?',
        answer: `Yes. The functions are applied in sequence, and each one changes the coordinate system for those that follow. <code>translateX(100px) rotate(45deg)</code> moves the element right and then rotates it in place, while <code>rotate(45deg) translateX(100px)</code> rotates the axes first, so the element moves diagonally. The same functions in a different order give a different result.`,
      },
    ],
  },

  'animations': {
    whyItMatters: `Loading spinners, pulsing notification badges and elements that fade in as a page appears are keyframe animations. Unlike a transition, they need no trigger and can loop for ever. Used sparingly they draw attention to what matters; overused they distract and can make some users unwell, so they come with a responsibility.`,
    exercise: {
      prompt: `Define an animation named <code>pulse</code> that scales an element from its normal size to 110%. Apply it to the button so that it runs for 1 second with an ease-in-out timing, repeats for ever, and plays forwards then backwards.

Expected result: the button grows and shrinks smoothly and continuously.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: @keyframes pulse, from scale(1) to scale(1.1) */

button {
  /* TODO: run pulse for 1s, ease-in-out, infinitely, alternating */
}`,
      hints: [
        'Keyframes are defined with <code>from</code> and <code>to</code>, or with percentages.',
        'The shorthand takes the values in this order: <code>animation: pulse 1s ease-in-out infinite alternate</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}

button {
  animation: pulse 1s ease-in-out infinite alternate;
}`,
    },
    quiz: [
      {
        question: 'Which at-rule defines the steps of an animation?',
        options: ['@animation', '@steps', '@transition', '@keyframes'],
        answer: 3,
        explanation: 'The animation property then refers to the keyframes by name.',
      },
      {
        question: 'What does <code>animation-fill-mode: forwards</code> do?',
        options: ['Keeps the styles of the last keyframe after the animation ends', 'Plays the animation in reverse', 'Makes it loop', 'Delays the start'],
        answer: 0,
        explanation: 'Without it, the element returns to its original styles when the animation finishes.',
      },
      {
        question: 'Which value makes an animation repeat without end?',
        options: ['animation-iteration-count: 0', 'animation-direction: loop', 'animation-iteration-count: infinite', 'animation-duration: forever'],
        answer: 2,
        explanation: 'The default iteration count is 1.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main animation properties?',
        answer: `<code>animation-name</code> refers to the <code>@keyframes</code> rule. <code>animation-duration</code> is the length of one cycle. <code>animation-timing-function</code> is the acceleration curve. <code>animation-delay</code> is the wait before starting. <code>animation-iteration-count</code> is how many times it runs. <code>animation-direction</code> sets normal, reverse or alternate. <code>animation-fill-mode</code> decides which styles apply before and after. <code>animation-play-state</code> pauses and resumes. The <code>animation</code> shorthand sets them together.`,
      },
      {
        question: 'How do you respect users who are sensitive to motion?',
        answer: `Use the <code>prefers-reduced-motion</code> media query. Inside <code>@media (prefers-reduced-motion: reduce)</code>, remove or greatly shorten animations and transitions that are not essential, and replace large movements with a simple fade. People with vestibular disorders can be made dizzy or nauseous by motion on screen, and this operating-system setting is how they ask sites to tone it down.`,
      },
    ],
  },

  'pseudo-classes-elements': {
    whyItMatters: `Pseudo-classes style an element according to its state or position: hovered, focused, the first child, every other row. Pseudo-elements style a part of an element or add decoration without extra markup. Together they remove the need for a great many helper classes and bits of JavaScript.`,
    exercise: {
      prompt: `Make the button's background gold while it is hovered. Give the button a 3px solid orange outline when it is focused with the keyboard. Make the first letter of the paragraph twice as large and bold. Add an asterisk after the heading text using CSS only.

Expected result: a large first letter, a heading followed by an asterisk, and a button that reacts to hover and to keyboard focus.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

/* TODO: button background on hover */

/* TODO: button outline on keyboard focus */

/* TODO: first letter of the paragraph */

/* TODO: an asterisk after the heading */`,
      hints: [
        '<code>:focus-visible</code> matches when the browser decides a focus indicator is needed, which includes keyboard focus.',
        '<code>::after</code> needs a <code>content</code> property, such as <code>content: " *"</code>, or nothing is rendered.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

button:hover {
  background: gold;
}

button:focus-visible {
  outline: 3px solid orange;
}

p::first-letter {
  font-size: 2em;
  font-weight: bold;
}

h1::after {
  content: " *";
}`,
    },
    quiz: [
      {
        question: 'What is the difference between a pseudo-class and a pseudo-element?',
        options: ['There is none', 'A pseudo-class selects an element in a particular state; a pseudo-element selects a part of an element', 'A pseudo-element selects a state', 'Pseudo-classes only work on links'],
        answer: 1,
        explanation: 'Pseudo-classes use one colon, as in :hover; pseudo-elements use two, as in ::before.',
      },
      {
        question: 'What must a <code>::before</code> or <code>::after</code> rule contain to be displayed?',
        options: ['A width', 'A class', 'A z-index', 'The content property'],
        answer: 3,
        explanation: 'It can be an empty string, content: "", but it must be present.',
      },
      {
        question: 'Which selector matches every even-numbered table row?',
        options: ['tr:nth-child(even)', 'tr:even', 'tr::second', 'tr:nth-of-row(2)'],
        answer: 0,
        explanation: ':nth-child also accepts odd and formulas such as 3n + 1.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between :nth-child and :nth-of-type?',
        answer: `<code>p:nth-child(2)</code> matches a <code>p</code> that is the second child of its parent, counting every sibling whatever its type; if the second child is not a <code>p</code>, nothing matches. <code>p:nth-of-type(2)</code> counts only the <code>p</code> siblings and matches the second of them. They give the same result only when all the siblings are of the same type.`,
      },
      {
        question: 'What are ::before and ::after used for?',
        answer: `They insert a generated box as the first or last child of an element, with content supplied by the <code>content</code> property. They are used for decoration that does not belong in the HTML: icons, quotation marks, badges, custom list markers, overlays and shapes. Because the content is not part of the document, important text must not be placed there; some screen readers read it and some do not.`,
      },
    ],
  },

  'architecture': {
    whyItMatters: `CSS is easy to write and hard to maintain. In a large project, every rule is global, and a change made for one page breaks another. Naming conventions and component-scoped styles are how teams keep thousands of lines of CSS predictable, and employers look for developers who can explain their approach.`,
    exercise: {
      prompt: `This exercise is about naming, so the preview will not change. The three selectors below depend on the exact structure of the HTML and are very specific. Rewrite them as flat BEM class selectors for a block named <code>card</code>: the block itself, its <code>title</code> element, and a <code>featured</code> modifier.

Expected result: three single-class selectors, <code>.card</code>, <code>.card__title</code> and <code>.card--featured</code>, with the same declarations.`,
      starterCode: `div#content section.cards div.card {
  padding: 1rem;
  border: 1px solid #ddd;
}

div#content section.cards div.card h2 {
  font-size: 1.25rem;
}

div#content section.cards div.card.featured {
  border-color: gold;
}`,
      hints: [
        'In BEM, an element is written <code>block__element</code> and a modifier <code>block--modifier</code>.',
        'Each rule needs only one class, so all three have the same low specificity.',
      ],
      solution: `.card {
  padding: 1rem;
  border: 1px solid #ddd;
}

.card__title {
  font-size: 1.25rem;
}

.card--featured {
  border-color: gold;
}`,
    },
    quiz: [
      {
        question: 'In the BEM class <code>menu__item--active</code>, which part is the modifier?',
        options: ['menu', 'item', 'active', 'menu__item'],
        answer: 2,
        explanation: 'menu is the block, item the element, and active the modifier.',
      },
      {
        question: 'What is the main problem with a selector such as <code>#sidebar ul li a span</code>?',
        options: ['It is tied to the exact HTML structure and has high specificity, so it breaks easily and is hard to override', 'It is invalid', 'It is too short', 'It cannot be used with media queries'],
        answer: 0,
        explanation: 'A single class on the element is more robust.',
      },
      {
        question: 'What do CSS Modules and scoped styles in frameworks provide?',
        options: ['Faster downloads', 'Automatic animations', 'A replacement for HTML', 'Class names that are unique to one component, so styles cannot leak between components'],
        answer: 3,
        explanation: 'The build tool rewrites the class names so that they cannot clash.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is BEM and what problem does it solve?',
        answer: `BEM stands for Block, Element, Modifier. A block is a standalone component, such as <code>card</code>; an element is a part of it, written <code>card__title</code>; a modifier is a variation, written <code>card--featured</code>. Every rule is a single class, so specificity stays flat and no rule depends on the HTML structure. The names also show which component a class belongs to, which prevents clashes in a global stylesheet.`,
      },
      {
        question: 'How do you organise CSS in a large project?',
        answer: `Split styles by component, so that each component's CSS sits beside its markup. Keep global CSS small: a reset, design tokens as custom properties, and base typography. Use one consistent method to avoid name clashes, whether BEM, CSS Modules, scoped styles or utility classes. Keep specificity low and avoid <code>!important</code>. A linter such as Stylelint enforces the conventions automatically.`,
      },
    ],
  },

  'accessibility': {
    whyItMatters: `CSS can make a page unusable without changing a word of it: pale grey text that cannot be read in sunlight, a removed focus outline that leaves keyboard users lost, motion that makes some people ill. A few rules, written once, prevent all three, and they are checked in every accessibility audit.`,
    exercise: {
      prompt: `Fix three problems. The paragraph's light grey text has too little contrast on white; change it to <code>#374151</code>. The button's focus outline has been removed; give keyboard users a 3px solid outline in <code>#1d4ed8</code> with a 2px offset. The button animates constantly; stop the animation for users who prefer reduced motion.

Expected result: darker paragraph text, a visible outline when the button is reached with the Tab key, and no pulsing when the system's reduced-motion setting is on.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

p {
  color: #c0c0c0;
}

button {
  outline: none;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  to {
    transform: scale(1.1);
  }
}`,
      hints: [
        'Remove <code>outline: none</code> and style <code>button:focus-visible</code>.',
        'The motion preference is tested with <code>@media (prefers-reduced-motion: reduce)</code>.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

p {
  color: #374151;
}

button {
  animation: pulse 1s infinite alternate;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

@keyframes pulse {
  to {
    transform: scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    animation: none;
  }
}`,
    },
    quiz: [
      {
        question: 'What contrast ratio does WCAG level AA require for normal-sized text?',
        options: ['2:1', '4.5:1', '3:1', '7:1'],
        answer: 1,
        explanation: 'Large text needs 3:1. Level AAA asks for 7:1 for normal text.',
      },
      {
        question: 'Why is <code>outline: none</code> on focusable elements a problem?',
        options: ['It slows the page', 'It breaks hover styles', 'Keyboard users can no longer see which element has focus', 'It is invalid CSS'],
        answer: 2,
        explanation: 'If the default outline is removed, a clear replacement focus style must be provided.',
      },
      {
        question: 'What does <code>:focus-visible</code> match that <code>:focus</code> does not distinguish?',
        options: ['Focus that the browser judges should be shown, such as keyboard focus, and usually not a mouse click on a button', 'Only mouse clicks', 'Only links', 'Hidden elements'],
        answer: 0,
        explanation: 'It lets keyboard users have a strong focus ring without showing it on every mouse click.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How can CSS harm accessibility?',
        answer: `Low contrast between text and background makes content unreadable for many people. Removing focus outlines hides the keyboard position. <code>display: none</code> hides content from screen readers as well as from sight, and changing the visual order with flexbox or grid can make it differ from the reading and tab order. Fixed pixel font sizes ignore the user's settings, and unrestrained animation can cause real discomfort.`,
      },
      {
        question: 'How do you hide content visually but keep it available to screen readers?',
        answer: `Use a "visually hidden" utility class that takes the element out of view without removing it from the accessibility tree: absolute positioning, a size of 1px, <code>overflow: hidden</code> and a clip that hides the content. It is used for text such as a label for an icon-only button or a "skip to content" link. <code>display: none</code> and <code>visibility: hidden</code> must not be used for this, since they hide the content from everyone.`,
      },
    ],
  },

  'container-queries': {
    whyItMatters: `A media query asks how wide the window is, but a reusable component needs to know how wide its own container is: the same card may sit in a narrow sidebar or a wide main column on the same screen. Container queries answer that, and they are the most significant addition to responsive design in years. All current browsers support them.`,
    exercise: {
      prompt: `Make <code>main</code> a query container. By default the heading is 1.25rem. When <code>main</code> itself is at least 400px wide, the heading grows to 2rem and the button gets larger padding of 1rem by 2rem.

Expected result: the heading and the button grow when <code>main</code> reaches 400px wide, whatever the width of the window.`,
      starterCode: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  /* TODO: make main a container that can be queried on its inline size */
}

h1 {
  font-size: 1.25rem;
}

/* TODO: when main is at least 400px wide, enlarge the heading
         and give the button more padding */`,
      hints: [
        'The container is declared with <code>container-type: inline-size</code>.',
        'The query is written <code>@container (min-width: 400px) { ... }</code> and styles the descendants of the container, not the container itself.',
      ],
      solution: `/* The page contains: <main> with an <h1>, a <p> and a <button> */

main {
  container-type: inline-size;
}

h1 {
  font-size: 1.25rem;
}

@container (min-width: 400px) {
  h1 {
    font-size: 2rem;
  }

  button {
    padding: 1rem 2rem;
  }
}`,
    },
    quiz: [
      {
        question: 'What does a container query respond to?',
        options: ['The width of the browser window', 'The size of the screen', 'The user\'s font size', 'The size of an ancestor element declared as a container'],
        answer: 3,
        explanation: 'That is the difference from a media query, which looks at the viewport.',
      },
      {
        question: 'Which declaration turns an element into a query container for its width?',
        options: ['container-type: inline-size', 'display: container', 'query: width', 'contain: all'],
        answer: 0,
        explanation: 'inline-size is the width in horizontal writing modes.',
      },
      {
        question: 'Can the rules inside <code>@container</code> style the container element itself?',
        options: ['Yes, always', 'Only its width', 'No; they apply to its descendants', 'Only with !important'],
        answer: 2,
        explanation: 'A container cannot depend on its own size, so the query targets what is inside it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a media query and a container query?',
        answer: `A media query tests the viewport and other features of the device, so it suits decisions about the overall page layout. A container query tests the size of a specific ancestor element, so a component can adapt to the space it has been given. The same card can then be wide in the main column and compact in a sidebar on one screen, which media queries cannot express.`,
      },
      {
        question: 'Why must the container be declared explicitly?',
        answer: `For a query on size to work, the browser has to be able to size the container without looking at its contents, otherwise the contents could change the size that the query depends on. <code>container-type: inline-size</code> applies that containment for the inline direction. Naming a container with <code>container-name</code> lets a query target a particular ancestor when several containers are nested.`,
      },
    ],
  },
}
