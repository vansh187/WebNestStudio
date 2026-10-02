// Practice blocks for the HTML course. Merged onto the lesson entries in index.js by slug,
// so the lesson prose files stay unchanged.
// Each exercise is a complete page or fragment that runs in the web playground; the prompt
// says what the finished page should show.
export const practiceHtml = {
  'setting-up-your-editor-and-browser-devtools': {
    whyItMatters: `Every web developer spends the day in two tools: an editor and the browser's DevTools. DevTools shows the page as the browser actually built it, the styles that apply to an element, and the errors your script raised. Learning to open the Console and the Elements panel now saves hours of guessing later.`,
    exercise: {
      prompt: `The script should change the heading to <code>DevTools works</code>, but nothing happens. Run the page, open the Console in DevTools (or the playground's console) and read the error. Then fix the one mistake in the markup.

Expected result: the heading on the page reads <code>DevTools works</code>.`,
      starterCode: `<h1 id="tittle">Hello</h1>

<script>
  document.getElementById("title").textContent = "DevTools works";
</script>`,
      hints: [
        'The error says that a property cannot be set on <code>null</code>, which means <code>getElementById</code> found nothing.',
        'Compare the id the script looks for with the id written on the heading.',
      ],
      solution: `<h1 id="title">Hello</h1>

<script>
  document.getElementById("title").textContent = "DevTools works";
</script>`,
    },
    quiz: [
      {
        question: 'Which DevTools panel shows the HTML of the page as the browser currently has it?',
        options: ['Elements', 'Network', 'Console', 'Application'],
        answer: 0,
        explanation: 'The Elements panel shows the live DOM, including changes made by scripts.',
      },
      {
        question: 'Where do JavaScript errors and <code>console.log</code> messages appear?',
        options: ['The Elements panel', 'The Console panel', 'The Sources panel only', 'The address bar'],
        answer: 1,
        explanation: 'The Console lists messages and errors, with the file and line they came from.',
      },
      {
        question: 'What does an extension such as Live Server do?',
        options: ['Publishes the site to the internet', 'Checks the HTML for errors', 'Serves the files locally and reloads the page when a file is saved', 'Compresses images'],
        answer: 2,
        explanation: 'It removes the need to refresh the browser by hand after each change.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you use browser DevTools when a page does not look or behave as expected?',
        answer: `Check the Console first for errors. Use the Elements panel to inspect the element: confirm that the markup is what you expect and look at the Styles pane to see which CSS rules apply and which are crossed out. The Network panel shows whether files and API requests loaded and with what status. For script problems, set a breakpoint in the Sources panel and step through the code.`,
      },
      {
        question: 'What is the difference between "View page source" and the Elements panel?',
        answer: `View page source shows the HTML text exactly as the server sent it. The Elements panel shows the DOM, the tree the browser built from that text, after it has corrected invalid markup and after JavaScript has added, removed or changed elements. On a page built by a framework the two can be very different.`,
      },
    ],
  },

  'document-structure': {
    whyItMatters: `Every page you ever write starts from the same skeleton. Leave out the doctype and browsers fall back to an old compatibility mode with different layout rules; leave out the language or the character encoding and screen readers and special characters go wrong. Getting the skeleton right once means every page starts correct.`,
    exercise: {
      prompt: `Complete the skeleton of a valid HTML5 document: add the doctype, the language of the page (English), the character encoding and a title that reads <code>My first page</code>.

Expected result: the page shows the heading <code>Hello, HTML</code>, and the browser tab title is <code>My first page</code>.`,
      starterCode: `<!-- TODO: doctype -->
<html>
  <head>
    <!-- TODO: character encoding -->
    <!-- TODO: title -->
  </head>
  <body>
    <h1>Hello, HTML</h1>
  </body>
</html>`,
      hints: [
        'The HTML5 doctype is <code>&lt;!DOCTYPE html&gt;</code> and must be the very first line.',
        'The language goes on the <code>html</code> element as <code>lang="en"</code>, and the encoding is <code>&lt;meta charset="utf-8"&gt;</code>.',
      ],
      solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, HTML</h1>
  </body>
</html>`,
    },
    quiz: [
      {
        question: 'What happens if the doctype is missing?',
        options: ['The browser renders the page in quirks mode, with older layout behaviour', 'The page does not load', 'The CSS is ignored', 'Nothing changes'],
        answer: 0,
        explanation: 'The doctype tells the browser to use standards mode.',
      },
      {
        question: 'Which element contains the content that is displayed in the browser window?',
        options: ['&lt;body&gt;', '&lt;title&gt;', '&lt;meta&gt;', '&lt;head&gt;'],
        answer: 0,
        explanation: 'The head holds information about the page; the body holds what the visitor sees.',
      },
      {
        question: 'What is the purpose of <code>lang="en"</code> on the <code>html</code> element?',
        options: ['It translates the page', 'It tells browsers, screen readers and search engines the language of the content', 'It sets the font', 'It is required for CSS to work'],
        answer: 1,
        explanation: 'A screen reader uses it to choose the correct pronunciation.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the purpose of the DOCTYPE declaration?',
        answer: `<code>&lt;!DOCTYPE html&gt;</code> tells the browser that the document is HTML5 and should be rendered in standards mode. Without it, browsers use quirks mode, which imitates the behaviour of very old browsers and changes how the box model and other layout rules work. It is not an HTML element and has no closing tag.`,
      },
      {
        question: 'What is the difference between the head and the body of a document?',
        answer: `The <code>head</code> contains information about the document that is not shown as page content: the title, character encoding, viewport settings, description, and links to stylesheets and scripts. The <code>body</code> contains everything that is rendered for the user: text, images, links, forms. There is exactly one of each, both inside the <code>html</code> element.`,
      },
    ],
  },

  'semantic-html': {
    whyItMatters: `A page built only from <code>div</code> elements looks fine but tells a screen reader or a search engine nothing about which part is the navigation, the main content or the footer. Semantic elements carry that meaning for free. They are the base of accessibility and SEO, and interviewers ask about them constantly.`,
    exercise: {
      prompt: `Replace each <code>div</code> with the semantic element that matches its role. Do not change the text.

Expected result: the page looks the same, but uses <code>header</code>, <code>nav</code>, <code>main</code>, <code>article</code> and <code>footer</code>.`,
      starterCode: `<div class="header">
  <h1>WebNest Blog</h1>
  <div class="nav">
    <a href="/">Home</a>
    <a href="/posts">Posts</a>
  </div>
</div>

<div class="main">
  <div class="post">
    <h2>Why semantics matter</h2>
    <p>Semantic elements describe their content.</p>
  </div>
</div>

<div class="footer">
  <p>Copyright WebNest Studio</p>
</div>`,
      hints: [
        'The block of links is navigation, and the self-contained blog post is an article.',
        'A page should have one <code>main</code> element, wrapping the primary content.',
      ],
      solution: `<header>
  <h1>WebNest Blog</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/posts">Posts</a>
  </nav>
</header>

<main>
  <article>
    <h2>Why semantics matter</h2>
    <p>Semantic elements describe their content.</p>
  </article>
</main>

<footer>
  <p>Copyright WebNest Studio</p>
</footer>`,
    },
    quiz: [
      {
        question: 'Which element should wrap the primary content of a page, and appear only once?',
        options: ['&lt;section&gt;', '&lt;article&gt;', '&lt;main&gt;', '&lt;div&gt;'],
        answer: 2,
        explanation: 'Assistive technology offers a shortcut that jumps straight to main.',
      },
      {
        question: 'Which element is right for a blog post that would still make sense on its own, outside the page?',
        options: ['&lt;nav&gt;', '&lt;aside&gt;', '&lt;span&gt;', '&lt;article&gt;'],
        answer: 3,
        explanation: 'An article is self-contained content. An aside is content only loosely related to what surrounds it.',
      },
      {
        question: 'When is a <code>div</code> the correct choice?',
        options: ['When no semantic element fits and a container is needed only for styling or layout', 'For every block of content', 'For the main navigation', 'Never'],
        answer: 0,
        explanation: 'div and span have no meaning of their own, which is exactly what a styling hook needs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is semantic HTML and why does it matter?',
        answer: `Semantic HTML means choosing elements for what the content is, not for how it looks: <code>nav</code> for navigation, <code>button</code> for an action, <code>h1</code> to <code>h6</code> for headings. It matters because screen readers use the elements to announce and navigate the page, search engines use them to understand it, and other developers can read the structure at a glance. It also brings built-in behaviour, such as keyboard support for buttons and links.`,
      },
      {
        question: 'What is the difference between section, article and div?',
        answer: `An <code>article</code> is a complete, self-contained piece of content that could be reused elsewhere, such as a blog post or a product card. A <code>section</code> is a thematic grouping of content within a page, normally with its own heading. A <code>div</code> has no meaning and is used purely as a container for styling or scripting when neither of the others applies.`,
      },
    ],
  },

  'headings': {
    whyItMatters: `Headings are the outline of a page. Screen-reader users navigate by jumping from heading to heading, and search engines read them to work out what the page is about. Choosing a heading level because of its size, instead of its place in the outline, breaks both.`,
    exercise: {
      prompt: `The heading levels below were chosen for their size, and the outline makes no sense. Fix them so that there is one <code>h1</code>, the two main sections are <code>h2</code>, and the sub-section is <code>h3</code>.

Expected result: an outline of Python Course, then Basics (with Variables under it), then Projects.`,
      starterCode: `<h3>Python Course</h3>

<h1>Basics</h1>
<p>Start here.</p>

<h4>Variables</h4>
<p>Names that refer to values.</p>

<h1>Projects</h1>
<p>Build something real.</p>`,
      hints: [
        'The title of the page is the single <code>h1</code>.',
        'A sub-section is one level below its parent section, so levels are never skipped on the way down.',
      ],
      solution: `<h1>Python Course</h1>

<h2>Basics</h2>
<p>Start here.</p>

<h3>Variables</h3>
<p>Names that refer to values.</p>

<h2>Projects</h2>
<p>Build something real.</p>`,
    },
    quiz: [
      {
        question: 'How many heading levels does HTML have?',
        options: ['Four', 'Six', 'Five', 'Unlimited'],
        answer: 1,
        explanation: 'They run from h1, the most important, to h6.',
      },
      {
        question: 'You want smaller heading text. What should you do?',
        options: ['Use a lower heading level such as h4', 'Use a bold paragraph', 'Keep the correct level and change the size with CSS', 'Use &lt;small&gt; around the page title'],
        answer: 2,
        explanation: 'The level states the place in the outline. Appearance is the job of CSS.',
      },
      {
        question: 'Which is the generally recommended number of <code>h1</code> elements on a page?',
        options: ['As many as possible for SEO', 'One per paragraph', 'None', 'One, describing the page as a whole'],
        answer: 3,
        explanation: 'A single h1 gives the page one clear title.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why should heading levels not be skipped?',
        answer: `The levels form a nested outline. Going from an <code>h2</code> straight to an <code>h4</code> suggests that a level is missing, which confuses people who navigate by headings with a screen reader, since they rely on the levels to understand how sections relate. Moving back up, from an <code>h4</code> to an <code>h2</code> when a new section starts, is fine.`,
      },
      {
        question: 'How do headings affect SEO?',
        answer: `Search engines use headings to understand the topic and structure of a page, with the <code>h1</code> carrying the most weight as the statement of what the page is about. Clear, descriptive headings also make content easier to scan, which keeps visitors on the page. Stuffing keywords into headings or using several competing <code>h1</code> elements does not help.`,
      },
    ],
  },

  'links': {
    whyItMatters: `Links are what make the web a web. Getting the URL type wrong produces links that work on your machine and break when the site is deployed, and vague link text such as "click here" fails both screen-reader users and search engines. Links are simple, and they are also where many small, avoidable mistakes are made.`,
    exercise: {
      prompt: `Create three links: a relative link to <code>about.html</code> with the text <code>About us</code>; an external link to <code>https://developer.mozilla.org</code> with the text <code>MDN Web Docs</code> that opens in a new tab safely; and an email link to <code>hello@example.com</code> with the text <code>Email us</code>.

Expected result: three working links, one per line, with descriptive text.`,
      starterCode: `<!-- TODO: relative link to about.html -->

<!-- TODO: external link that opens in a new tab -->

<!-- TODO: email link -->`,
      hints: [
        'A new tab is requested with <code>target="_blank"</code>, and <code>rel="noopener noreferrer"</code> should accompany it.',
        'An email link uses the <code>mailto:</code> scheme in the <code>href</code>.',
      ],
      solution: `<p><a href="about.html">About us</a></p>

<p><a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN Web Docs</a></p>

<p><a href="mailto:hello@example.com">Email us</a></p>`,
    },
    quiz: [
      {
        question: 'What does <code>href="#contact"</code> link to?',
        options: ['The element on the same page whose id is contact', 'The site\'s contact page', 'An email address', 'A file named #contact'],
        answer: 0,
        explanation: 'A fragment starting with # scrolls to the element with that id.',
      },
      {
        question: 'Why add <code>rel="noopener"</code> to a link with <code>target="_blank"</code>?',
        options: ['It makes the link load faster', 'It stops the new page from getting a reference to the page that opened it', 'It is required for the link to open', 'It hides the link from search engines'],
        answer: 1,
        explanation: 'Without it, the opened page could redirect the original tab through window.opener. Current browsers apply noopener by default, but stating it protects older ones.',
      },
      {
        question: 'Which link text is best?',
        options: ['Click here', 'Read more', 'Download the 2026 price list (PDF)', 'Link'],
        answer: 2,
        explanation: 'It makes sense when read out of context, which is how screen-reader users often hear links.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between an absolute and a relative URL?',
        answer: `An absolute URL contains the full address, including the scheme and domain, such as <code>https://example.com/about</code>; it points to the same place wherever it is used and is needed for links to other sites. A relative URL, such as <code>about.html</code> or <code>../images/logo.png</code>, is resolved against the address of the current page, so it keeps working when the site moves to another domain. A URL beginning with <code>/</code> is relative to the root of the site.`,
      },
      {
        question: 'When should you use a link and when a button?',
        answer: `Use a link, <code>&lt;a href&gt;</code>, when activating it takes the user to another page or another place on the page. Use a <code>button</code> when it performs an action on the current page, such as submitting a form or opening a menu. The distinction matters to keyboard and screen-reader users, who expect a link to navigate and a button to act, and each has its own built-in keyboard behaviour.`,
      },
    ],
  },

  'metadata': {
    whyItMatters: `Nothing in the <code>head</code> appears on the page, yet it decides whether special characters display correctly, whether the page fits a phone screen, and what title and description appear in search results and when the link is shared. A missing viewport tag alone makes a site look broken on mobile.`,
    exercise: {
      prompt: `Add four items to the <code>head</code>: the UTF-8 character encoding, a viewport tag for mobile devices, the title <code>Learn HTML | WebNest</code>, and a meta description reading <code>A beginner-friendly HTML course.</code>

Expected result: the page still shows only the heading; the tab title is <code>Learn HTML | WebNest</code>.`,
      starterCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- TODO: charset, viewport, title, description -->
  </head>
  <body>
    <h1>Learn HTML</h1>
  </body>
</html>`,
      hints: [
        'The viewport tag is <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>.',
        'The description uses <code>name="description"</code> and puts the text in the <code>content</code> attribute.',
      ],
      solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Learn HTML | WebNest</title>
    <meta name="description" content="A beginner-friendly HTML course.">
  </head>
  <body>
    <h1>Learn HTML</h1>
  </body>
</html>`,
    },
    quiz: [
      {
        question: 'What happens on a phone when the viewport meta tag is missing?',
        options: ['The page loads without CSS', 'The page does not load', 'Images are hidden', 'The page is shown at a wide desktop width and scaled down, so everything is tiny'],
        answer: 3,
        explanation: 'width=device-width tells the browser to use the real width of the screen.',
      },
      {
        question: 'Where does the text of the <code>title</code> element appear?',
        options: ['In the browser tab, in bookmarks and as the headline in search results', 'Nowhere', 'At the top of the page content', 'In the footer'],
        answer: 0,
        explanation: 'It is not part of the visible page body.',
      },
      {
        question: 'Why should <code>&lt;meta charset="utf-8"&gt;</code> come early in the head?',
        options: ['It loads the fonts', 'The browser needs the encoding before it reads text such as the title', 'It makes the page load faster', 'It is only a convention'],
        answer: 1,
        explanation: 'The declaration must be within the first 1024 bytes of the document.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does the viewport meta tag do?',
        answer: `It controls how a page is sized on mobile devices. <code>width=device-width</code> sets the layout width to the width of the screen, and <code>initial-scale=1</code> sets the starting zoom to 100%. Without it, mobile browsers lay the page out on a virtual screen about 980 pixels wide and shrink it to fit, so text is unreadably small and media queries for small screens never apply. It is a requirement for responsive design.`,
      },
      {
        question: 'Does the meta description affect search ranking?',
        answer: `Not directly; Google has said it is not used as a ranking signal. It matters because it is often shown as the snippet under the title in search results, so a clear, accurate description of roughly 150 to 160 characters encourages people to click. Search engines may replace it with text from the page if they judge that a better match for the query.`,
      },
    ],
  },

  'images': {
    whyItMatters: `Images are usually the largest files on a page, and the most common accessibility failure on the web is an image with no text alternative. Three attributes do most of the work: <code>alt</code> for people who cannot see the image, <code>width</code> and <code>height</code> to stop the page jumping as it loads, and <code>loading</code> to delay images that are off screen.`,
    exercise: {
      prompt: `Add two images. The first is a meaningful photo, <code>team.jpg</code>, 600 by 400 pixels, with the alternative text <code>The WebNest team at their desks</code>, loaded lazily. The second is a purely decorative divider, <code>divider.png</code>, which screen readers should skip.

Expected result: two <code>img</code> elements with correct attributes (the files do not exist, so the browser shows the alternative text of the first and nothing for the second).`,
      starterCode: `<h1>About us</h1>

<!-- TODO: the team photo -->

<!-- TODO: the decorative divider -->`,
      hints: [
        'Lazy loading is requested with <code>loading="lazy"</code>.',
        'A decorative image still needs the attribute, but empty: <code>alt=""</code>.',
      ],
      solution: `<h1>About us</h1>

<img src="team.jpg" alt="The WebNest team at their desks" width="600" height="400" loading="lazy">

<img src="divider.png" alt="">`,
    },
    quiz: [
      {
        question: 'What is the correct <code>alt</code> for a purely decorative image?',
        options: ['alt="image"', 'No alt attribute at all', 'An empty value: alt=""', 'alt="decorative"'],
        answer: 2,
        explanation: 'An empty alt tells screen readers to skip the image. With no alt attribute, many read out the file name.',
      },
      {
        question: 'Why set <code>width</code> and <code>height</code> on an image?',
        options: ['To compress the file', 'To improve the image quality', 'It is required for the image to display', 'So the browser reserves the right space before the image loads, which prevents the layout from shifting'],
        answer: 3,
        explanation: 'The browser works out the aspect ratio from the two values.',
      },
      {
        question: 'What does the <code>srcset</code> attribute do?',
        options: ['Lists versions of the image so the browser can choose one suited to the screen', 'Sets the alternative text', 'Adds a caption', 'Loads the image twice'],
        answer: 0,
        explanation: 'A phone can download a small file and a large display a sharper one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you write good alt text?',
        answer: `Describe the content and purpose of the image in the context of the page, briefly, as you would to someone on the phone. Do not start with "image of", because the screen reader already announces that it is an image. If the image is a link or a button, describe where it goes or what it does. If the image is decorative or repeats text beside it, use an empty <code>alt=""</code>.`,
      },
      {
        question: 'How would you make images load efficiently?',
        answer: `Serve them at the size they are displayed and in an efficient format such as WebP or AVIF. Use <code>srcset</code> and <code>sizes</code>, or the <code>picture</code> element, so that small screens download small files. Add <code>loading="lazy"</code> to images below the first screen, but not to the main image at the top. Always give <code>width</code> and <code>height</code> to avoid layout shift.`,
      },
    ],
  },

  'lists': {
    whyItMatters: `Navigation menus, steps of a recipe, feature lists and glossaries are all lists, and marking them up as lists lets a screen reader announce how many items there are and move between them. Navigation menus in nearly every site you will inspect are an unordered list of links.`,
    exercise: {
      prompt: `Write the steps for making tea as an ordered list with three steps: <code>Boil water</code>, <code>Add the following</code> and <code>Pour and serve</code>. Inside the second step, nest an unordered list with the items <code>Tea leaves</code> and <code>Sugar</code>.

Expected result: a numbered list from 1 to 3, with two bullet points indented under step 2.`,
      starterCode: `<h2>How to make tea</h2>

<!-- TODO: ordered list with a nested unordered list in step 2 -->`,
      hints: [
        'An ordered list is <code>ol</code>, an unordered list is <code>ul</code>, and each item is an <code>li</code>.',
        'The nested list goes inside the <code>li</code> of step 2, before that <code>li</code> is closed.',
      ],
      solution: `<h2>How to make tea</h2>

<ol>
  <li>Boil water</li>
  <li>
    Add the following
    <ul>
      <li>Tea leaves</li>
      <li>Sugar</li>
    </ul>
  </li>
  <li>Pour and serve</li>
</ol>`,
    },
    quiz: [
      {
        question: 'Which list should be used for steps that must be followed in sequence?',
        options: ['&lt;ul&gt;', '&lt;ol&gt;', '&lt;dl&gt;', '&lt;menu&gt;'],
        answer: 1,
        explanation: 'An ordered list is for content where the order matters.',
      },
      {
        question: 'Which elements may be direct children of a <code>ul</code> or <code>ol</code>?',
        options: ['&lt;p&gt; and &lt;li&gt;', 'Any element', 'Only &lt;li&gt; elements', 'Another &lt;ul&gt;'],
        answer: 2,
        explanation: 'A nested list must be placed inside an li, not directly inside the parent list.',
      },
      {
        question: 'Which elements make up a description list?',
        options: ['ul, li', 'ol, li', 'table, tr, td', 'dl, dt, dd'],
        answer: 3,
        explanation: 'dl is the list, dt a term, and dd its description.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the three types of list in HTML?',
        answer: `An unordered list, <code>ul</code>, for items whose order does not matter, shown with bullets. An ordered list, <code>ol</code>, for items in a sequence, shown with numbers; it accepts <code>start</code>, <code>reversed</code> and <code>type</code> attributes. A description list, <code>dl</code>, for pairs of terms and descriptions, using <code>dt</code> and <code>dd</code>, as in a glossary.`,
      },
      {
        question: 'Why are navigation menus usually marked up as a list?',
        answer: `A menu is a set of related links, which is what a list expresses. Marked up as a <code>ul</code> inside a <code>nav</code>, it lets a screen reader announce that there is a navigation region containing a list of a given number of items, and lets the user skip it or step through it. The bullets and vertical layout are removed with CSS.`,
      },
    ],
  },

  'tables': {
    whyItMatters: `Prices, timetables, comparison charts and reports are tabular data, and a properly built table lets a screen reader say which row and column a cell belongs to. Tables were once misused for page layout; knowing why that is wrong, and how to mark up headers correctly, is a standard interview topic.`,
    exercise: {
      prompt: `Build a table with the caption <code>Course sizes</code>, a header row with the columns <code>Course</code> and <code>Lessons</code>, and two data rows: <code>HTML</code> with <code>18</code>, and <code>Python</code> with <code>121</code>. Mark the header cells as column headers.

Expected result: a table with a caption, one header row and two body rows.`,
      starterCode: `<table>
  <!-- TODO: caption -->
  <!-- TODO: thead with the two column headers -->
  <!-- TODO: tbody with the two rows -->
</table>`,
      hints: [
        'Header cells are <code>th</code>, and <code>scope="col"</code> says the header applies to its column.',
        'The header row goes in <code>thead</code> and the data rows in <code>tbody</code>.',
      ],
      solution: `<table>
  <caption>Course sizes</caption>
  <thead>
    <tr>
      <th scope="col">Course</th>
      <th scope="col">Lessons</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>HTML</td>
      <td>18</td>
    </tr>
    <tr>
      <td>Python</td>
      <td>121</td>
    </tr>
  </tbody>
</table>`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>th</code> and <code>td</code>?',
        options: ['There is none', 'th is a header cell that labels a row or column; td is a data cell', 'td is bold', 'th can only be used in the first row'],
        answer: 1,
        explanation: 'Screen readers announce the matching header when a data cell is read.',
      },
      {
        question: 'Which attribute makes one cell span two columns?',
        options: ['rowspan="2"', 'colspan="2"', 'span="2"', 'width="2"'],
        answer: 1,
        explanation: 'rowspan makes a cell span several rows.',
      },
      {
        question: 'Why should tables not be used to lay out a page?',
        options: ['They cannot contain images', 'They are no longer supported', 'Screen readers announce them as data tables, the markup is rigid, and CSS does layout better', 'They are slower than divs to download'],
        answer: 2,
        explanation: 'Layout belongs to CSS Flexbox and Grid; tables are for tabular data.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you make a data table accessible?',
        answer: `Give it a <code>caption</code> that says what the table contains. Mark header cells with <code>th</code> and add <code>scope="col"</code> or <code>scope="row"</code> so each header is tied to its column or row. Group rows with <code>thead</code>, <code>tbody</code> and <code>tfoot</code>. Keep the structure simple, avoiding merged cells where possible, and never use a table for layout.`,
      },
      {
        question: 'What are thead, tbody and tfoot for?',
        answer: `They group the rows of a table into a header section, the body and a footer section, such as totals. They add meaning for assistive technology, give CSS and JavaScript convenient hooks, and allow a browser to repeat the header and footer on each page when a long table is printed. A table can have several <code>tbody</code> elements to group related rows.`,
      },
    ],
  },

  'media': {
    whyItMatters: `Video and audio play natively in the browser with one element, no plugin needed. The details decide whether they are usable: without <code>controls</code> the user cannot pause, an autoplaying video with sound is blocked by the browser, and without captions the content is closed to deaf users and to anyone watching with the sound off.`,
    exercise: {
      prompt: `Add a video element that shows playback controls, offers two sources (<code>intro.webm</code> and then <code>intro.mp4</code>), has an English captions track from <code>intro.en.vtt</code>, and shows fallback text for browsers that cannot play video.

Expected result: a video player with controls (the files do not exist, so it will not play).`,
      starterCode: `<h2>Course introduction</h2>

<!-- TODO: video with controls, two sources, a captions track and fallback text -->`,
      hints: [
        'Each file goes in its own <code>source</code> element with <code>src</code> and <code>type</code>; the browser uses the first one it can play.',
        'Captions are a <code>track</code> element with <code>kind="captions"</code>, <code>srclang="en"</code> and a <code>label</code>.',
      ],
      solution: `<h2>Course introduction</h2>

<video controls width="640">
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  <track kind="captions" src="intro.en.vtt" srclang="en" label="English">
  Your browser does not support the video element.
</video>`,
    },
    quiz: [
      {
        question: 'What happens when a <code>video</code> element has no <code>controls</code> attribute?',
        options: ['The video cannot load', 'Default controls appear anyway', 'The video plays automatically', 'No play, pause or volume controls are shown'],
        answer: 3,
        explanation: 'Controls then have to be built with JavaScript, or the attribute added.',
      },
      {
        question: 'Browsers generally allow <code>autoplay</code> on a video only if it is also what?',
        options: ['Muted', 'Looped', 'Short', 'In MP4 format'],
        answer: 0,
        explanation: 'Autoplay with sound is blocked unless the user has interacted with the site.',
      },
      {
        question: 'Why list several <code>source</code> elements?',
        options: ['To play them one after another', 'So the browser can pick the first format it supports', 'To make the video louder', 'It is required by the specification'],
        answer: 1,
        explanation: 'Format support differs between browsers, so alternatives are offered in order of preference.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you make video content accessible?',
        answer: `Provide captions with a <code>track</code> element so that speech and important sounds are available as text, and a transcript for people who cannot use the video at all. Keep the native <code>controls</code>, which are keyboard accessible, or make custom ones fully operable by keyboard. Do not autoplay with sound, and avoid content that flashes rapidly.`,
      },
      {
        question: 'What do the preload and poster attributes do?',
        answer: `<code>preload</code> hints how much of the file to fetch before the user presses play: <code>none</code>, <code>metadata</code> for just the duration and dimensions, or <code>auto</code> for as much as the browser sees fit. <code>poster</code> is the URL of an image shown in place of the video until playback starts. Using <code>preload="metadata"</code> with a poster keeps a page with video fast to load.`,
      },
    ],
  },

  'iframe-concepts': {
    whyItMatters: `Maps, videos, payment forms and embedded widgets are all pages inside your page, and that is what an <code>iframe</code> is. Because the embedded content comes from someone else, it is also a security boundary. Knowing how to restrict what an embedded page may do is part of building safely.`,
    exercise: {
      prompt: `Embed the page <code>https://example.com</code> in an iframe that is 600 by 300 pixels, has the accessible title <code>Example site</code>, is loaded lazily, and is sandboxed so that the embedded page may run scripts but nothing else.

Expected result: a framed area showing example.com.`,
      starterCode: `<h2>Embedded page</h2>

<!-- TODO: a sandboxed, titled, lazily loaded iframe -->`,
      hints: [
        'The <code>title</code> attribute tells screen-reader users what the frame contains.',
        '<code>sandbox</code> with no value applies every restriction; listing <code>allow-scripts</code> lifts just that one.',
      ],
      solution: `<h2>Embedded page</h2>

<iframe
  src="https://example.com"
  title="Example site"
  width="600"
  height="300"
  loading="lazy"
  sandbox="allow-scripts">
</iframe>`,
    },
    quiz: [
      {
        question: 'What does an <code>iframe</code> do?',
        options: ['Draws a border around content', 'Loads a script', 'Embeds another HTML page inside the current page', 'Creates a popup window'],
        answer: 2,
        explanation: 'The embedded document has its own separate browsing context.',
      },
      {
        question: 'What is the effect of <code>sandbox=""</code> with an empty value?',
        options: ['No restrictions are applied', 'All restrictions are applied: no scripts, forms, popups or same-origin access', 'The frame is hidden', 'Only scripts are blocked'],
        answer: 1,
        explanation: 'Individual permissions are then granted by listing tokens such as allow-scripts.',
      },
      {
        question: 'Why give an iframe a <code>title</code> attribute?',
        options: ['It is shown as a caption', 'It improves loading speed', 'It is required for the frame to load', 'Screen readers announce it, so users know what the frame contains'],
        answer: 3,
        explanation: 'Without it, the frame is announced only as "frame".',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the security risks of iframes and how are they reduced?',
        answer: `Embedded third-party content could run scripts, open popups, submit forms or try to navigate your page. The <code>sandbox</code> attribute removes those abilities unless they are explicitly allowed, and the <code>allow</code> attribute controls access to features such as the camera. In the other direction, your own page can be embedded by a malicious site to trick users into clicking, which is called clickjacking; it is prevented by sending the <code>Content-Security-Policy: frame-ancestors</code> header or <code>X-Frame-Options</code>.`,
      },
      {
        question: 'Can a page read or change the content of an iframe it embeds?',
        answer: `Only if both documents have the same origin, meaning the same scheme, host and port. For a different origin, the same-origin policy blocks all direct access to the frame's DOM. The two pages can still communicate deliberately by sending messages with <code>window.postMessage</code>, and the receiver should check the origin of each message before trusting it.`,
      },
    ],
  },

  'forms': {
    whyItMatters: `Login, sign-up, search, checkout and contact pages are all forms. They are how users send data to a server. Understanding what <code>action</code>, <code>method</code> and <code>name</code> do explains what actually leaves the browser when the button is pressed, which is essential for working with any back end.`,
    exercise: {
      prompt: `Build a contact form that sends its data with the POST method to <code>/contact</code>. It needs a text field named <code>name</code>, a multi-line field named <code>message</code>, each with a label, and a submit button reading <code>Send</code>.

Expected result: a form with two labelled fields and a Send button.`,
      starterCode: `<!-- TODO: form with action and method -->
<!-- TODO: labelled name field -->
<!-- TODO: labelled message field -->
<!-- TODO: submit button -->`,
      hints: [
        'A field is submitted only if it has a <code>name</code> attribute.',
        'A multi-line field is a <code>textarea</code>, and a label is connected to its field by matching <code>for</code> and <code>id</code>.',
      ],
      solution: `<form action="/contact" method="post">
  <p>
    <label for="name">Name</label>
    <input type="text" id="name" name="name">
  </p>
  <p>
    <label for="message">Message</label>
    <textarea id="message" name="message"></textarea>
  </p>
  <button type="submit">Send</button>
</form>`,
    },
    quiz: [
      {
        question: 'Where does a form with <code>method="get"</code> put the submitted data?',
        options: ['In the URL, as a query string', 'In the request body', 'In a cookie', 'In local storage'],
        answer: 0,
        explanation: 'With POST the data travels in the body of the request.',
      },
      {
        question: 'An input has an <code>id</code> but no <code>name</code>. What is sent when the form is submitted?',
        options: ['The id and the value', 'The value only', 'Nothing for that input', 'An error is raised'],
        answer: 2,
        explanation: 'The name is the key under which the value is sent. Without it the field is left out.',
      },
      {
        question: 'What is the default <code>type</code> of a <code>button</code> element inside a form?',
        options: ['button', 'submit', 'link', 'reset'],
        answer: 1,
        explanation: 'A button meant only to run JavaScript should be given type="button" so that it does not submit the form.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between GET and POST for a form?',
        answer: `With GET, the field values are appended to the URL as a query string. The result can be bookmarked and shared and is right for searches and filters, but the data is visible, limited in length and stored in browser history, so it must not be used for passwords or for anything that changes data. With POST, the values are sent in the request body; it is used for logins, sign-ups and any submission that creates or changes something.`,
      },
      {
        question: 'What happens when a form is submitted?',
        answer: `The browser runs its built-in validation, and stops if a field is invalid. Otherwise it collects each successful control, meaning those with a <code>name</code> that are not disabled, as name and value pairs, encodes them, and sends an HTTP request to the URL in <code>action</code> using the given <code>method</code>. The browser then loads the response as a new page, unless JavaScript handled the submit event and called <code>preventDefault()</code>.`,
      },
    ],
  },

  'inputs': {
    whyItMatters: `Choosing the right input type gives you a great deal for free: a phone shows a numeric keypad for <code>tel</code> and an @ key for <code>email</code>, a date field opens a calendar, and the browser checks the format. A label tied to its input is the single most important thing for form accessibility, and its absence is one of the most common faults found in audits.`,
    exercise: {
      prompt: `Add four labelled controls to the form: an email field named <code>email</code>; a number field named <code>age</code> that accepts 18 to 99; a checkbox named <code>newsletter</code> with the label <code>Send me news</code>; and two radio buttons named <code>plan</code> with the values <code>free</code> and <code>pro</code>.

Expected result: four labelled controls; only one of the two radio buttons can be selected at a time.`,
      starterCode: `<form>
  <!-- TODO: email -->
  <!-- TODO: age, 18 to 99 -->
  <!-- TODO: newsletter checkbox -->
  <!-- TODO: plan radio buttons: free and pro -->
</form>`,
      hints: [
        'Radio buttons form one group, where only one can be chosen, when they share the same <code>name</code>.',
        'A range for a number is set with <code>min</code> and <code>max</code>.',
      ],
      solution: `<form>
  <p>
    <label for="email">Email</label>
    <input type="email" id="email" name="email">
  </p>
  <p>
    <label for="age">Age</label>
    <input type="number" id="age" name="age" min="18" max="99">
  </p>
  <p>
    <input type="checkbox" id="newsletter" name="newsletter">
    <label for="newsletter">Send me news</label>
  </p>
  <p>
    <input type="radio" id="plan-free" name="plan" value="free">
    <label for="plan-free">Free</label>
    <input type="radio" id="plan-pro" name="plan" value="pro">
    <label for="plan-pro">Pro</label>
  </p>
</form>`,
    },
    quiz: [
      {
        question: 'How is a <code>label</code> connected to its input?',
        options: ['By placing them on the same line', 'The label\'s name matches the input\'s name', 'The label\'s for attribute matches the input\'s id', 'By giving both the same class'],
        answer: 2,
        explanation: 'Alternatively the input can be placed inside the label element.',
      },
      {
        question: 'What makes several radio buttons act as one group?',
        options: ['Being in the same paragraph', 'Having the same id', 'Having the same value', 'Having the same name'],
        answer: 3,
        explanation: 'Within one name, selecting a radio button deselects the others.',
      },
      {
        question: 'Why is a <code>placeholder</code> not a substitute for a label?',
        options: ['It disappears when the user types, has low contrast and is not reliably announced', 'It is not supported by browsers', 'It is submitted with the form', 'It only works for passwords'],
        answer: 0,
        explanation: 'A placeholder is a hint about the format, used in addition to a visible label.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why does every form control need a label?',
        answer: `A label gives the control an accessible name, so a screen reader announces what the field is for when it receives focus. Clicking or tapping the label also focuses or toggles the control, which enlarges the target, a real help for small checkboxes and radio buttons on touch screens. A field with no label is announced only as "edit text", leaving the user to guess.`,
      },
      {
        question: 'What is the benefit of using specific input types such as email, tel and date?',
        answer: `The browser adapts to the type. Mobile devices show a keyboard suited to the data, such as digits for <code>tel</code> and <code>number</code>. Built-in validation checks the format of <code>email</code> and <code>url</code>. Types such as <code>date</code> and <code>color</code> provide a native picker. Password managers and autofill also use the type, together with the <code>autocomplete</code> attribute, to fill in fields correctly.`,
      },
    ],
  },

  'validation': {
    whyItMatters: `Catching a mistake before the form is sent saves the user a round trip and a re-typed form. HTML can require a field, limit its length and check its format with attributes alone. It is equally important to know the limit of this: anyone can bypass the browser, so the server must check everything again.`,
    exercise: {
      prompt: `Add validation with attributes only. The username is required, between 3 and 15 characters, and may contain only lower-case letters and digits. The email is required. The quantity must be between 1 and 10.

Expected result: pressing Submit with an empty or invalid field shows the browser's own error message and does not submit.`,
      starterCode: `<form>
  <p>
    <label for="username">Username</label>
    <input type="text" id="username" name="username">
  </p>
  <p>
    <label for="email">Email</label>
    <input type="email" id="email" name="email">
  </p>
  <p>
    <label for="quantity">Quantity</label>
    <input type="number" id="quantity" name="quantity">
  </p>
  <button type="submit">Submit</button>
</form>`,
      hints: [
        'Use <code>required</code>, <code>minlength</code>, <code>maxlength</code>, <code>min</code> and <code>max</code>.',
        'The allowed characters are set with <code>pattern="[a-z0-9]+"</code>; a <code>title</code> explains the rule in the error message.',
      ],
      solution: `<form>
  <p>
    <label for="username">Username</label>
    <input type="text" id="username" name="username" required minlength="3" maxlength="15"
           pattern="[a-z0-9]+" title="Lower-case letters and digits only">
  </p>
  <p>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </p>
  <p>
    <label for="quantity">Quantity</label>
    <input type="number" id="quantity" name="quantity" min="1" max="10">
  </p>
  <button type="submit">Submit</button>
</form>`,
    },
    quiz: [
      {
        question: 'Which attribute makes a field mandatory?',
        options: ['mandatory', 'required', 'validate', 'notnull'],
        answer: 1,
        explanation: 'The form will not submit while a required field is empty.',
      },
      {
        question: 'Is browser validation enough to protect the server?',
        options: ['Yes, it cannot be bypassed', 'Yes, if pattern is used', 'No; requests can be sent without the browser, so the server must validate again', 'Only for email fields'],
        answer: 2,
        explanation: 'Client-side validation is for the user\'s convenience, not for security.',
      },
      {
        question: 'What does the <code>novalidate</code> attribute on a form do?',
        options: ['Disables the submit button', 'Makes every field required', 'Hides error messages only', 'Turns off the browser\'s built-in validation for that form'],
        answer: 3,
        explanation: 'It is used when validation is handled entirely by custom JavaScript.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between client-side and server-side validation?',
        answer: `Client-side validation runs in the browser, through HTML attributes or JavaScript, and gives the user immediate feedback without a network request. It can be bypassed completely, by editing the page in DevTools or by sending the request with another tool. Server-side validation runs on the server for every request and is the one that protects the data. A good form does both: the client for usability, the server for correctness and security.`,
      },
      {
        question: 'Which HTML attributes provide validation without JavaScript?',
        answer: `<code>required</code> for mandatory fields; <code>minlength</code> and <code>maxlength</code> for text length; <code>min</code>, <code>max</code> and <code>step</code> for numbers and dates; <code>pattern</code> for a regular expression the whole value must match; and the input <code>type</code> itself, such as <code>email</code> or <code>url</code>, which checks the format. The CSS pseudo-classes <code>:valid</code> and <code>:invalid</code> style fields according to the result.`,
      },
    ],
  },

  'accessibility': {
    whyItMatters: `Around one person in six lives with a disability, and many more use a keyboard, a small screen or a slow connection. An inaccessible site shuts them out and, in many countries, breaks the law. Most accessibility comes free from using the right HTML elements, which is why it is treated as a core skill and not as an extra.`,
    exercise: {
      prompt: `The page below has three accessibility faults: a clickable <code>div</code> that cannot be reached or activated with the keyboard, an image with no text alternative, and an input with no label. Fix all three using native HTML.

Expected result: the Save control is a real button that logs <code>Saved</code> to the console when activated with the mouse or the keyboard, the logo has the alternative text <code>WebNest Studio</code>, and the field has the visible label <code>Search</code>.`,
      starterCode: `<img src="logo.png">

<div onclick="console.log('Saved')">Save</div>

<input type="text" name="q">`,
      hints: [
        'A <code>button</code> element is focusable and responds to Enter and Space without any extra code.',
        'Connect a <code>label</code> to the input with matching <code>for</code> and <code>id</code> attributes.',
      ],
      solution: `<img src="logo.png" alt="WebNest Studio">

<button type="button" onclick="console.log('Saved')">Save</button>

<label for="q">Search</label>
<input type="text" id="q" name="q">`,
    },
    quiz: [
      {
        question: 'Why is <code>&lt;div onclick="..."&gt;</code> a poor substitute for a button?',
        options: ['It cannot be focused with the Tab key, does not respond to Enter or Space, and is not announced as a button', 'It is slower', 'Divs cannot have click handlers', 'It cannot be styled'],
        answer: 0,
        explanation: 'A real button provides all three behaviours with no extra work.',
      },
      {
        question: 'What is the first rule of ARIA?',
        options: ['Add ARIA to every element', 'If a native HTML element provides the behaviour you need, use it instead of ARIA', 'ARIA replaces semantic HTML', 'ARIA is only for images'],
        answer: 1,
        explanation: 'ARIA changes what is announced but adds no behaviour, so native elements are more reliable.',
      },
      {
        question: 'What does <code>tabindex="0"</code> do?',
        options: ['Makes the element first in the tab order', 'Removes the element from the tab order', 'Places the element in the keyboard tab order at its natural position', 'Hides the element'],
        answer: 2,
        explanation: 'tabindex="-1" makes an element focusable by script only. Positive values should be avoided.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you make a website accessible?',
        answer: `Start with semantic HTML: real headings, landmarks, lists, buttons and links. Give every image appropriate alt text and every form control a label. Make sure everything works with the keyboard alone and that the focused element is clearly visible. Keep enough colour contrast, and do not convey information by colour only. Provide captions for video. Then test by using the page with a keyboard and a screen reader, alongside automated tools.`,
      },
      {
        question: 'What is ARIA and when should it be used?',
        answer: `ARIA is a set of attributes, such as <code>role</code>, <code>aria-label</code> and <code>aria-expanded</code>, that tell assistive technology what an element is and what state it is in. It is for custom components that have no native equivalent, such as tabs or a combobox, and for conveying dynamic state. It should not be used where a native element already does the job, because ARIA does not add keyboard behaviour, and incorrect ARIA makes a page worse than none.`,
      },
    ],
  },

  'seo-basics': {
    whyItMatters: `A page that cannot be found does not get read. Search engines work from the HTML: the title, the description, the headings, the link text and the alt text. Clean, well-structured markup is the part of SEO that a developer controls directly, and it costs nothing extra to do properly.`,
    exercise: {
      prompt: `Improve the page for search engines. Give it the title <code>Free Python Course for Beginners | WebNest</code>, the meta description <code>Learn Python step by step with free lessons and exercises.</code>, and a canonical link to <code>https://example.com/python</code>. In the body, make the main heading an <code>h1</code>, and replace the link text <code>click here</code> with <code>Start the first Python lesson</code>.

Expected result: a page with one h1 and a descriptive link.`,
      starterCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Page</title>
  </head>
  <body>
    <p><b>Free Python Course</b></p>
    <p>To begin, <a href="/python/intro">click here</a>.</p>
  </body>
</html>`,
      hints: [
        'The canonical URL is declared with <code>&lt;link rel="canonical" href="..."&gt;</code> in the head.',
        'A bold paragraph is not a heading; use an <code>h1</code>.',
      ],
      solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Free Python Course for Beginners | WebNest</title>
    <meta name="description" content="Learn Python step by step with free lessons and exercises.">
    <link rel="canonical" href="https://example.com/python">
  </head>
  <body>
    <h1>Free Python Course</h1>
    <p><a href="/python/intro">Start the first Python lesson</a></p>
  </body>
</html>`,
    },
    quiz: [
      {
        question: 'Which element is the most important on-page signal of what a page is about?',
        options: ['The footer', 'The meta keywords tag', 'The first image', 'The title element'],
        answer: 3,
        explanation: 'It is also the headline shown in search results. The meta keywords tag is ignored by Google.',
      },
      {
        question: 'What is a canonical link for?',
        options: ['To tell search engines which URL is the preferred version when several URLs show the same content', 'To hide a page from search engines', 'To link to the home page', 'To speed up the page'],
        answer: 0,
        explanation: 'It consolidates ranking signals on one URL and avoids duplicate-content problems.',
      },
      {
        question: 'How do you ask search engines not to index a page?',
        options: ['By removing the title', '&lt;meta name="robots" content="noindex"&gt;', 'With rel="canonical"', 'By hiding it with CSS'],
        answer: 1,
        explanation: 'The page must remain crawlable for the instruction to be seen.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which parts of the HTML matter most for SEO?',
        answer: `A unique, descriptive <code>title</code> and meta description for each page. One clear <code>h1</code> and a logical heading structure. Semantic elements that show what is main content and what is navigation. Descriptive link text and image alt text. A canonical link where content is reachable at more than one URL, and structured data in JSON-LD so that search engines can show rich results. The page also needs the viewport tag, since Google indexes the mobile version.`,
      },
      {
        question: 'What is structured data?',
        answer: `Structured data is machine-readable information about a page, written in the schema.org vocabulary and usually embedded as JSON-LD in a <code>script type="application/ld+json"</code> element. It tells search engines explicitly that the page is, for example, a product with a price and rating, an article with an author, or a course. It can make the page eligible for rich results such as star ratings and FAQ listings.`,
      },
    ],
  },

  'best-practices': {
    whyItMatters: `HTML is forgiving: browsers quietly repair broken markup, so mistakes do not show up as errors. They show up later, as a layout that differs between browsers or a script that cannot find an element. Consistent, valid markup is what makes a codebase pleasant for the next developer, who is often you.`,
    exercise: {
      prompt: `Clean up the markup: use lower-case tag names, close the paragraph and list items properly, quote the attribute value, and move the inline styles into a class named <code>highlight</code> in a <code>style</code> element.

Expected result: the same content, with the paragraph in red bold text, written as valid, consistently formatted HTML.`,
      starterCode: `<H1>Features</H1>
<P style="color: red; font-weight: bold">New this month
<UL>
<LI>Faster search
<LI>Dark mode
</UL>
<a href=about.html>About</a>`,
      hints: [
        'A paragraph cannot contain a list, so close the <code>p</code> before the <code>ul</code> starts.',
        'In the <code>style</code> element, write <code>.highlight { color: red; font-weight: bold; }</code> and apply it with <code>class="highlight"</code>.',
      ],
      solution: `<style>
  .highlight {
    color: red;
    font-weight: bold;
  }
</style>

<h1>Features</h1>
<p class="highlight">New this month</p>
<ul>
  <li>Faster search</li>
  <li>Dark mode</li>
</ul>
<a href="about.html">About</a>`,
    },
    quiz: [
      {
        question: 'Why are inline <code>style</code> attributes discouraged?',
        options: ['They do not work in modern browsers', 'They are slower to type', 'They mix presentation with content, cannot be reused and are hard to override', 'They break links'],
        answer: 2,
        explanation: 'Styles in a stylesheet can be reused across pages and changed in one place.',
      },
      {
        question: 'What does an HTML validator check?',
        options: ['That the links are popular', 'That the page looks good', 'That the page loads quickly', 'That the markup follows the HTML standard'],
        answer: 3,
        explanation: 'The W3C validator reports unclosed tags, invalid nesting and duplicate ids.',
      },
      {
        question: 'Which statement about <code>id</code> values is correct?',
        options: ['An id must be unique within the page', 'An id may contain spaces', 'An id is required on every element', 'Several elements may share one id'],
        answer: 0,
        explanation: 'Labels, fragment links and getElementById all rely on ids being unique.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why should content, presentation and behaviour be kept separate?',
        answer: `HTML describes the content and its meaning, CSS its appearance, and JavaScript its behaviour. Keeping them in separate files means a design can change without touching the content, styles and scripts are cached and reused across pages, and each part can be read, tested and maintained by itself. Inline styles and inline event handlers scatter these concerns through the markup and are difficult to override or update.`,
      },
      {
        question: 'What are some common HTML mistakes?',
        answer: `Choosing elements for their appearance, such as a heading level for its size. Leaving images without <code>alt</code> and inputs without labels. Using a <code>div</code> where a <code>button</code> or link is needed. Nesting elements incorrectly, such as a block element inside a paragraph. Reusing the same <code>id</code>. Omitting the doctype, the <code>lang</code> attribute or the viewport tag. Most are caught by a validator and an accessibility checker.`,
      },
    ],
  },

  'web-components-basics': {
    whyItMatters: `Web components let you define your own HTML elements, with their own markup and styles that do not leak in or out, using only what the browser provides. They work in any framework or with none, which is why design systems at large companies are often built on them. They also explain ideas, such as components and encapsulation, that React and Vue borrow.`,
    exercise: {
      prompt: `Define a custom element named <code>hello-card</code>. It should attach an open shadow root and render a paragraph that reads <code>Hello, </code> followed by the value of its <code>name</code> attribute, in blue text styled inside the shadow DOM.

Expected result: the page shows <code>Hello, Asha</code> in blue, and the ordinary paragraph below it keeps its default colour.`,
      starterCode: `<hello-card name="Asha"></hello-card>
<p>This paragraph is outside the component.</p>

<script>
  class HelloCard extends HTMLElement {
    connectedCallback() {
      // TODO: attach an open shadow root
      // TODO: set its innerHTML to a style rule and a paragraph using the name attribute
    }
  }

  // TODO: register the element under the name "hello-card"
</script>`,
      hints: [
        'The shadow root is created with <code>this.attachShadow({ mode: "open" })</code>.',
        'Register the class with <code>customElements.define("hello-card", HelloCard)</code>. The name must contain a hyphen.',
      ],
      solution: `<hello-card name="Asha"></hello-card>
<p>This paragraph is outside the component.</p>

<script>
  class HelloCard extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const name = this.getAttribute("name");
      shadow.innerHTML = "<style>p { color: blue; }</style><p>Hello, " + name + "</p>";
    }
  }

  customElements.define("hello-card", HelloCard);
</script>`,
    },
    quiz: [
      {
        question: 'Which rule applies to the name of a custom element?',
        options: ['It must start with a capital letter', 'It must contain a hyphen', 'It must end in -element', 'It must be a single word'],
        answer: 1,
        explanation: 'The hyphen keeps custom names from clashing with present and future built-in elements.',
      },
      {
        question: 'What does the Shadow DOM provide?',
        options: ['Server-side rendering', 'Faster rendering', 'Encapsulation: the component\'s markup and styles are isolated from the rest of the page', 'A database in the browser'],
        answer: 2,
        explanation: 'Styles inside do not leak out, and page styles do not reach in.',
      },
      {
        question: 'When is <code>connectedCallback</code> called?',
        options: ['When the class is defined', 'When the page is closed', 'When an attribute changes', 'Each time the element is added to the document'],
        answer: 3,
        explanation: 'It is the usual place to render the content of the component.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the three technologies that make up web components?',
        answer: `Custom Elements, the JavaScript API for defining new HTML elements and their behaviour through lifecycle callbacks. Shadow DOM, which attaches a separate, encapsulated DOM tree to an element so its markup and styles are isolated. And HTML templates, the <code>template</code> and <code>slot</code> elements, which hold markup that is not rendered until it is used and mark where content supplied by the user of the component is placed.`,
      },
      {
        question: 'How do web components compare with framework components such as React?',
        answer: `Web components are a browser standard: they need no library, and an element defined once can be used in plain HTML or inside any framework. Framework components offer a richer development model, with declarative rendering, state management and a large ecosystem, but only work within that framework. Web components suit shared design systems and widgets that must work everywhere; frameworks suit building whole applications. The two can be combined.`,
      },
    ],
  },
}
