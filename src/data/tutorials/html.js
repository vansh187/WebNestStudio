// HTML module — hand-written lesson content.
// Keys match the fixed topic slugs used by the HTML learning module.
export const htmlContent = {
  'document-structure': {
    title: 'HTML Document Structure',
    intro: `Every HTML document follows a predictable skeleton that browsers rely on to parse and render a page correctly. Before you touch tags, attributes, or styling, you need to understand this skeleton, because getting it wrong — even subtly — can cause a browser to fall back into "quirks mode" and render your page inconsistently.

The structure exists for a reason: it tells the browser which version of HTML you're using, separates metadata from visible content, and gives assistive technology and search engines a predictable place to look for information about the page.`,
    sections: [
      {
        heading: 'The DOCTYPE Declaration',
        body: `The very first line of any HTML5 document must be <code>&lt;!DOCTYPE html&gt;</code>. This is not a tag in the traditional sense — it's an instruction to the browser that says "render this page in standards mode, using the modern HTML5 rules." Older HTML versions had long, complex DOCTYPE strings tied to DTDs (Document Type Definitions); HTML5 simplified this to a single short line. Omitting the DOCTYPE, or placing anything before it, can trigger quirks mode, where the browser emulates old, inconsistent rendering behavior from the 1990s.`,
      },
      {
        heading: 'The html, head, and body Elements',
        body: `Immediately after the DOCTYPE comes the root <code>&lt;html&gt;</code> element, which wraps the entire document and should carry a <code>lang</code> attribute (e.g. <code>lang="en"</code>) so screen readers and translation tools know the page's language. Inside <code>&lt;html&gt;</code> there are exactly two top-level children in order:`,
        list: [
          '<code>&lt;head&gt;</code> — contains metadata that is not directly displayed: the page title, character encoding, linked stylesheets, scripts, and SEO-related meta tags.',
          '<code>&lt;body&gt;</code> — contains everything the user actually sees and interacts with: text, images, forms, links, and other visible content.',
        ],
      },
      {
        heading: 'Why Order and Nesting Matter',
        body: `Browsers are forgiving and will attempt to fix malformed HTML, but relying on that forgiveness produces fragile pages. The <code>&lt;head&gt;</code> must come before the <code>&lt;body&gt;</code>, tags should be properly nested (closing in the reverse order they were opened), and every element that requires a closing tag should have one. Well-formed structure is also what makes a page validate cleanly and behave consistently across different browsers and parsers.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal, complete HTML5 document skeleton',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Welcome to Webnest Studio</h1>
  <p>This is a minimal, valid HTML5 document.</p>
</body>
</html>`,
        output: 'Renders a page with the browser tab titled "My First Page", showing a heading and a paragraph of text in the body.',
      },
    ],
    commonMistakes: [
      'Forgetting the <!DOCTYPE html> declaration, which can push older or non-standard browsers into quirks mode.',
      'Placing visible content or stylesheets directly inside <head> instead of <body>.',
      'Omitting the lang attribute on <html>, which hurts accessibility and search engine language detection.',
      'Nesting tags out of order (e.g. closing a <div> before a <p> that was opened inside it), producing invalid, unpredictable markup.',
    ],
    keyPoints: [
      'Every HTML5 document starts with <!DOCTYPE html> as the very first line.',
      'The <html> element wraps exactly two children: <head> (metadata) and <body> (visible content), in that order.',
      'Always set lang on <html> for accessibility, translation tools, and search engines.',
      'Well-nested, well-closed tags produce predictable rendering across browsers.',
    ],
  },

  'semantic-html': {
    title: 'Semantic HTML Elements',
    intro: `Semantic HTML means choosing elements based on the meaning of the content they contain, not just how they happen to look. A <code>&lt;div&gt;</code> tells a browser and a screen reader nothing about what's inside it; a <code>&lt;nav&gt;</code> or <code>&lt;article&gt;</code> tells them exactly what role that content plays on the page.

Using semantic elements is not a stylistic preference — it directly affects accessibility (screen readers use these landmarks to let users jump between sections), SEO (search engines weigh semantically marked-up content differently), and long-term maintainability of your codebase.`,
    sections: [
      {
        heading: 'Core Layout Semantic Elements',
        body: `HTML5 introduced a set of elements specifically to describe common page regions, replacing the old convention of using generically named <div id="header"> or <div class="nav"> containers.`,
        list: [
          '<code>&lt;header&gt;</code> — introductory content for a page or a section, often containing a logo, title, or navigation.',
          '<code>&lt;nav&gt;</code> — a block of primary navigation links.',
          '<code>&lt;main&gt;</code> — the single, unique main content of the document (only one per page).',
          '<code>&lt;article&gt;</code> — a self-contained piece of content that would make sense on its own, like a blog post or news story.',
          '<code>&lt;section&gt;</code> — a thematic grouping of content, usually with its own heading.',
          '<code>&lt;footer&gt;</code> — closing content for a page or section, often containing copyright info or secondary links.',
        ],
      },
      {
        heading: 'Semantic Elements vs. Generic div',
        body: `A <code>&lt;div&gt;</code> is a generic container with no inherent meaning — it exists purely for grouping and styling. Semantic elements should be used whenever an appropriate one exists, and <code>&lt;div&gt;</code> should be reserved for cases where no semantic element fits (a purely visual wrapper for a CSS grid layout, for example). Overusing <div> for everything is sometimes called "divitis," and it strips a page of the structural meaning that assistive technology and search engines depend on.`,
      },
      {
        heading: 'How This Helps Accessibility and SEO',
        body: `Screen readers build a navigable outline of a page using landmark elements like <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;header&gt;</code>, letting users skip directly to the content they want instead of tabbing through everything. Search engines similarly use semantic structure to better understand which part of a page is the primary content versus supporting material like navigation or a sidebar.`,
      },
    ],
    examples: [
      {
        caption: 'A semantic page layout replacing generic divs',
        code: `<body>
  <header>
    <h1>Webnest Studio</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
    </nav>
  </header>

  <main>
    <article>
      <h2>Why Semantic HTML Matters</h2>
      <p>Semantic elements describe meaning, not just appearance.</p>
    </article>
  </main>

  <footer>
    <p>&copy; 2026 Webnest Studio</p>
  </footer>
</body>`,
        output: 'Renders a page with a header/navigation bar, a main article section with a heading and paragraph, and a footer — while also exposing header, nav, main, and footer as landmarks to screen readers.',
      },
    ],
    commonMistakes: [
      'Using <div> for every layout region instead of <header>, <nav>, <main>, and <footer>, which removes useful structure for accessibility tools.',
      'Including more than one <main> element on a single page — there should only ever be one.',
      'Using <section> purely for visual grouping without a meaningful heading, when a <div> would be more appropriate.',
      'Nesting an <article> inside a <nav> or otherwise mismatching semantic elements with content that doesn\'t match their intended meaning.',
    ],
    keyPoints: [
      'Semantic elements describe the meaning/role of content, not just its appearance.',
      'Common landmarks: header, nav, main, article, section, footer.',
      'Use <div> only when no semantic element fits the content\'s purpose.',
      'Semantic structure directly improves screen reader navigation and SEO interpretation.',
    ],
  },

  headings: {
    title: 'HTML Headings and Hierarchy',
    intro: `HTML provides six levels of headings, <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>, used to organize content into a logical outline — much like chapters and subheadings in a book. Headings are not a font-size shortcut; they are structural markers that describe how content is nested and related.

Getting heading hierarchy right matters more than most beginners expect: it directly affects how screen reader users navigate a page and how search engines interpret the relative importance of your content.`,
    sections: [
      {
        heading: 'The h1–h6 Hierarchy',
        body: `<code>&lt;h1&gt;</code> represents the most important heading on the page — typically the page's main title — and should generally appear only once per page. <code>&lt;h2&gt;</code> introduces major sections beneath it, <code>&lt;h3&gt;</code> introduces subsections within an <code>&lt;h2&gt;</code>, and so on down to <code>&lt;h6&gt;</code>. The numbers describe nesting depth, not visual size — although browsers do apply a default size that decreases as the number increases, that styling can and should be overridden with CSS rather than by picking a heading level for its default appearance.`,
      },
      {
        heading: 'Why Skipping Levels Hurts Accessibility and SEO',
        body: `Screen reader users frequently navigate a page by jumping between headings, and many screen readers let users request only a specific level ("show me all h2s"). If a page jumps from an <code>&lt;h1&gt;</code> straight to an <code>&lt;h4&gt;</code> because the h4 "looked right" visually, that user loses the logical structure of the page. Search engines also use heading hierarchy to understand topic structure and relative importance, so skipped or disordered levels can weaken how well a page's content is understood and indexed.`,
        list: [
          'Never choose a heading level purely because of its default font size — style headings with CSS instead.',
          'Do not skip levels going down (h1 to h3 with no h2) just to reach a desired visual weight.',
          'Keep exactly one h1 per page representing its primary topic.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A correctly nested heading outline for an article page',
        code: `<h1>Complete Guide to HTML Headings</h1>

<h2>Why Headings Matter</h2>
<p>Headings create a navigable outline of your content.</p>

<h2>Heading Levels</h2>
<h3>h1 through h3</h3>
<p>Used for the main title and major sections.</p>
<h3>h4 through h6</h3>
<p>Used for deeper nested subsections.</p>`,
        output: 'Renders a page with a large main title, two major section headings of decreasing size, and nested subsection headings — while also giving screen readers a clean, logically ordered outline to navigate.',
      },
    ],
    commonMistakes: [
      'Using multiple <h1> elements on a single page instead of one clear primary heading.',
      'Skipping heading levels (e.g. h1 straight to h4) purely to get a smaller default font size.',
      'Choosing heading tags based on their visual appearance rather than the content\'s logical structure.',
      'Using bold or large text styled to look like a heading instead of an actual heading element, which hides the structure from assistive technology.',
    ],
    keyPoints: [
      'Headings (h1–h6) describe document structure and nesting depth, not just visual size.',
      'Use exactly one h1 per page for the primary topic.',
      'Never skip heading levels — doing so breaks the logical outline for screen readers and SEO.',
      'Control heading appearance with CSS, not by picking a level for its default font size.',
    ],
  },

  links: {
    title: 'HTML Links and Navigation',
    intro: `The anchor element, <code>&lt;a&gt;</code>, is what makes the web a "web" — it creates clickable links between pages, resources, and locations within the same page. Understanding how link targets, URLs, and navigation behavior work is fundamental to building any usable site.`,
    sections: [
      {
        heading: 'The href Attribute and URL Types',
        body: `Every functional link needs an <code>href</code> attribute pointing to a destination. That destination can be an absolute URL (a complete web address including the protocol, like <code>https://example.com/page</code>) or a relative URL (a path relative to the current page's location, like <code>/about</code> or <code>../images/logo.png</code>). Absolute URLs are necessary when linking to an external site; relative URLs are preferred for internal links because they keep working correctly if the site's domain changes.`,
      },
      {
        heading: 'Opening Links in a New Tab Safely',
        body: `Setting <code>target="_blank"</code> makes a link open in a new tab or window. Doing this alone creates a subtle security and performance issue: the newly opened page gains partial access to the original page via <code>window.opener</code>, which a malicious destination could exploit. The fix is to always pair <code>target="_blank"</code> with <code>rel="noopener noreferrer"</code>, which severs that connection and also prevents the referrer URL from being passed along.`,
      },
      {
        heading: 'Other Link Types and Uses',
        body: `Links aren't limited to navigating between full pages. An <code>href</code> starting with <code>#</code> jumps to an element with a matching <code>id</code> on the same page (an in-page anchor). An <code>href</code> starting with <code>mailto:</code> opens the user's default email client with a pre-filled recipient, and <code>tel:</code> initiates a phone call on supporting devices.`,
        list: [
          '<code>&lt;a href="#section2"&gt;</code> — jumps to the element with <code>id="section2"</code> on the same page.',
          '<code>&lt;a href="mailto:info@example.com"&gt;</code> — opens the default email client.',
          '<code>&lt;a href="tel:+15551234567"&gt;</code> — initiates a phone call on mobile devices.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Relative, absolute, and safely-opened external links',
        code: `<a href="/services">Our Services</a> (relative internal link)

<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">
  MDN Web Docs
</a> (external link opened safely in a new tab)

<a href="#contact">Jump to Contact Section</a>`,
        output: 'Renders three clickable links: one navigates within the same site, one opens MDN in a new tab without exposing window.opener, and one scrolls the page to the element with id="contact".',
      },
    ],
    commonMistakes: [
      'Using target="_blank" without rel="noopener noreferrer", leaving a security gap via window.opener.',
      'Hardcoding absolute URLs (including the domain) for internal links instead of using relative paths.',
      'Forgetting the "#" prefix or matching id when linking to an in-page anchor, so the link does nothing.',
      'Using a styled <span> or <div> with a click handler instead of a real <a> tag, which breaks keyboard navigation and accessibility.',
    ],
    keyPoints: [
      'The href attribute defines a link\'s destination — absolute for external sites, relative for internal pages.',
      'Always pair target="_blank" with rel="noopener noreferrer" for security.',
      'In-page anchors use href="#id" to jump to an element with a matching id.',
      'mailto: and tel: links trigger email clients and phone calls respectively.',
    ],
  },

  metadata: {
    title: 'HTML Metadata Elements',
    intro: `Metadata is information about a page that isn't displayed directly to the user but is essential to how browsers, search engines, and social platforms handle it. Nearly all of it lives inside the <code>&lt;head&gt;</code> element, and a handful of specific tags matter enough that every page should include them.`,
    sections: [
      {
        heading: 'Character Encoding and Viewport',
        body: `<code>&lt;meta charset="UTF-8"&gt;</code> should be the first element inside <code>&lt;head&gt;</code>. It tells the browser how to interpret the bytes of the document as text, and UTF-8 supports virtually every character and symbol used worldwide, avoiding garbled text. The viewport meta tag, <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code>, tells mobile browsers to render the page at the device's actual width instead of a shrunken desktop-width version — without it, responsive CSS layouts often fail to work correctly on phones.`,
      },
      {
        heading: 'The Title and Meta Description',
        body: `<code>&lt;title&gt;</code> sets the text shown in the browser tab and is also the primary clickable headline search engines display in results. <code>&lt;meta name="description" content="..."&gt;</code> provides a short summary (ideally under about 160 characters) that search engines often display beneath the title in search results. Neither directly boosts ranking on its own, but both strongly influence whether a user clicks through from a search results page.`,
        list: [
          '<code>&lt;title&gt;</code> — should be unique per page and describe its content concisely.',
          '<code>&lt;meta name="description"&gt;</code> — a concise, compelling summary shown in search results.',
          '<code>&lt;meta charset="UTF-8"&gt;</code> — sets text encoding, should be first in <head>.',
          '<code>&lt;meta name="viewport"&gt;</code> — required for correct mobile/responsive rendering.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A head section with essential metadata tags',
        code: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webnest Studio — Web Development Tutorials</title>
  <meta name="description" content="Learn HTML, CSS, and JavaScript with clear, practical tutorials from Webnest Studio.">
</head>`,
        output: 'The browser tab displays "Webnest Studio — Web Development Tutorials"; the page renders correctly at any device width; search engines can index the title and description for search result snippets.',
      },
    ],
    commonMistakes: [
      'Omitting the viewport meta tag, causing mobile browsers to render a shrunken desktop layout instead of a responsive one.',
      'Placing meta charset anywhere other than as close to the top of <head> as possible, risking encoding issues with earlier content.',
      'Writing a meta description that is too long (gets truncated) or too generic to encourage clicks.',
      'Reusing the exact same <title> across every page of a site instead of a unique, descriptive one per page.',
    ],
    keyPoints: [
      'meta charset="UTF-8" and the viewport meta tag are essentially mandatory on every modern page.',
      'The <title> element sets the browser tab text and the clickable search result headline.',
      'meta name="description" supplies the summary text shown under a search result.',
      'Metadata itself is invisible on the page but strongly shapes SEO and mobile rendering.',
    ],
  },

  images: {
    title: 'HTML Images and Responsive Images',
    intro: `The <code>&lt;img&gt;</code> element embeds images into a page. Unlike most HTML elements, it is a self-closing (void) element with no separate closing tag, and it depends heavily on a few attributes to behave correctly, accessibly, and efficiently.`,
    sections: [
      {
        heading: 'The src and alt Attributes',
        body: `<code>src</code> points to the image file, either as a relative or absolute path. <code>alt</code> provides a text alternative describing the image's content or purpose, which is read aloud by screen readers, displayed if the image fails to load, and used by search engines to understand image content. Purely decorative images (a background flourish with no informational value) should use <code>alt=""</code> (an empty but present attribute) so screen readers skip over them silently instead of reading a distracting filename.`,
      },
      {
        heading: 'Width, Height, and Layout Shift',
        body: `Setting explicit <code>width</code> and <code>height</code> attributes on an <code>&lt;img&gt;</code> lets the browser reserve the correct amount of space before the image finishes loading, preventing the surrounding content from visibly jumping around as images load in — a problem known as cumulative layout shift. CSS can still control the final displayed size responsively; the HTML attributes primarily establish the image's aspect ratio for layout reservation.`,
      },
      {
        heading: 'Responsive Images with srcset',
        body: `The <code>srcset</code> attribute lets you offer multiple versions of an image at different resolutions, so the browser can pick the most appropriate one for the user's screen density and viewport size instead of always downloading one large file. This improves load performance on smaller or lower-density screens without sacrificing quality on larger, high-resolution ones.`,
      },
    ],
    examples: [
      {
        caption: 'An accessible image with explicit dimensions and responsive sources',
        code: `<img
  src="team-photo-800w.jpg"
  srcset="team-photo-400w.jpg 400w, team-photo-800w.jpg 800w, team-photo-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  width="800"
  height="533"
  alt="The Webnest Studio team standing outside the office">`,
        output: 'Displays a photo of the team, reserving 800x533 space to avoid layout shift, while the browser downloads whichever source image best matches the viewer\'s screen size; a screen reader announces "The Webnest Studio team standing outside the office."',
      },
    ],
    commonMistakes: [
      'Leaving alt text empty (or missing entirely) on meaningful images, making them invisible to screen reader users.',
      'Writing unhelpful alt text like "image123.jpg" instead of a description of the image\'s content or purpose.',
      'Omitting width and height attributes, causing visible layout shift as images load.',
      'Using one oversized image for all screen sizes instead of srcset, wasting bandwidth on mobile devices.',
    ],
    keyPoints: [
      '<img> is a self-closing element requiring src and a meaningful alt attribute.',
      'Use alt="" (empty) only for purely decorative images so screen readers skip them.',
      'width/height attributes reserve layout space and reduce cumulative layout shift.',
      'srcset lets the browser choose the best-fitting image source for the viewer\'s device.',
    ],
  },

  lists: {
    title: 'HTML Lists',
    intro: `HTML provides two main list types for grouping related items: unordered lists for items with no required sequence, and ordered lists for items whose order matters. Lists can also be nested inside one another to represent hierarchical relationships, such as a table of contents or a multi-level menu.`,
    sections: [
      {
        heading: 'Unordered and Ordered Lists',
        body: `An unordered list, <code>&lt;ul&gt;</code>, renders items with bullet points by default and is appropriate when the sequence of items doesn't matter — a list of features, ingredients, or navigation links. An ordered list, <code>&lt;ol&gt;</code>, renders items with numbers by default and should be used when sequence carries meaning — step-by-step instructions or a ranking. In both cases, each individual item is wrapped in an <code>&lt;li&gt;</code> (list item) element, and <code>&lt;li&gt;</code> is only valid as a direct child of <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code>, or <code>&lt;menu&gt;</code>.`,
      },
      {
        heading: 'Nesting Lists',
        body: `A nested list is created by placing an entire <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code> inside an <code>&lt;li&gt;</code> of a parent list. This is how multi-level navigation menus, outlines, and file-tree-style structures are built in plain HTML, and browsers automatically indent and adjust bullet or number styles at each nested level.`,
      },
      {
        heading: 'Description Lists',
        body: `A third, less common list type, <code>&lt;dl&gt;</code> (description list), pairs terms with their definitions using <code>&lt;dt&gt;</code> (term) and <code>&lt;dd&gt;</code> (description) elements. It's well suited to glossaries, metadata key-value pairs, or FAQ-style content.`,
      },
    ],
    examples: [
      {
        caption: 'An ordered list of steps containing a nested unordered list',
        code: `<ol>
  <li>Sign up for an account</li>
  <li>Choose a subscription plan
    <ul>
      <li>Basic</li>
      <li>Pro</li>
      <li>Enterprise</li>
    </ul>
  </li>
  <li>Start building your site</li>
</ol>`,
        output: 'Renders a numbered list with three main steps; the second step shows a bulleted sub-list of three plan options indented beneath it.',
      },
    ],
    commonMistakes: [
      'Placing text or other elements directly inside <ul> or <ol> without wrapping them in <li>.',
      'Using <br> to fake list spacing instead of using actual <li> elements for each item.',
      'Choosing <ul> for content where the order genuinely matters (like ranked steps), losing the numbered sequence.',
      'Forgetting to close the parent <li> after a nested list, breaking the list\'s structure.',
    ],
    keyPoints: [
      'Use <ul> when item order doesn\'t matter, <ol> when it does; each item goes inside <li>.',
      'Nested lists are built by placing a <ul> or <ol> inside a parent <li>.',
      '<dl>/<dt>/<dd> model term-definition pairs, useful for glossaries and FAQs.',
      '<li> is only valid directly inside <ul>, <ol>, or <menu>.',
    ],
  },

  tables: {
    title: 'HTML Tables',
    intro: `HTML tables are built for presenting tabular data — information that naturally has rows and columns, like a pricing comparison or a schedule. Tables have a well-defined internal structure with dedicated elements for headers, body rows, and (optionally) footers, and understanding that structure is what separates an accessible, well-formed table from a fragile pile of nested divs pretending to be one.`,
    sections: [
      {
        heading: 'Core Table Elements',
        body: `A table starts with <code>&lt;table&gt;</code>, which typically contains three sections: <code>&lt;thead&gt;</code> for the header row(s), <code>&lt;tbody&gt;</code> for the main data rows, and optionally <code>&lt;tfoot&gt;</code> for summary rows like totals. Each row is a <code>&lt;tr&gt;</code> (table row), and each row contains cells: <code>&lt;th&gt;</code> for header cells (bold and centered by default, and semantically marked as headers) and <code>&lt;td&gt;</code> for standard data cells.`,
        list: [
          '<code>&lt;thead&gt;</code> — wraps the header row(s), containing <code>&lt;th&gt;</code> cells.',
          '<code>&lt;tbody&gt;</code> — wraps the main data rows, containing <code>&lt;td&gt;</code> cells.',
          '<code>&lt;tfoot&gt;</code> — optional footer rows, often used for totals or summaries.',
          '<code>scope="col"</code> or <code>scope="row"</code> on <code>&lt;th&gt;</code> tells assistive technology which cells a header applies to.',
        ],
      },
      {
        heading: 'Why Tables Should Not Be Used for Page Layout',
        body: `In the early 2000s, developers commonly used tables to lay out entire web pages (headers, sidebars, columns) because CSS layout tools were immature. This is now considered bad practice: table-based layouts are inaccessible (screen readers announce layout tables as data tables, confusing users with irrelevant row/column announcements), inflexible for responsive design, and mix presentation with structure. Modern layout should always use CSS (Flexbox, Grid) instead, reserving <code>&lt;table&gt;</code> strictly for genuinely tabular data.`,
      },
    ],
    examples: [
      {
        caption: 'A properly structured data table with accessible header scope',
        code: `<table>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
      <th scope="col">Storage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Basic</td>
      <td>$5/mo</td>
      <td>10 GB</td>
    </tr>
    <tr>
      <td>Pro</td>
      <td>$15/mo</td>
      <td>100 GB</td>
    </tr>
  </tbody>
</table>`,
        output: 'Renders a data table with a bold header row (Plan, Price, Storage) and two data rows beneath it; screen readers announce each cell\'s associated column header when navigating.',
      },
    ],
    commonMistakes: [
      'Using <table> elements to build page layout grids instead of CSS Flexbox or Grid.',
      'Omitting <th> and using only <td> for header rows, losing semantic meaning and accessibility.',
      'Forgetting the scope attribute on header cells in complex tables, making them harder for screen readers to associate with data cells.',
      'Nesting a whole table inside a single <td> to fake multi-level layouts instead of using proper nested tables or CSS.',
    ],
    keyPoints: [
      'Tables are for tabular data, structured as thead/tbody/tfoot containing tr rows of th/td cells.',
      'th represents a header cell; td represents a standard data cell.',
      'scope="col"/"row" improves accessibility by associating data cells with their headers.',
      'Never use tables for general page layout — use CSS Flexbox or Grid instead.',
    ],
  },

  media: {
    title: 'HTML Media: Video and Audio',
    intro: `HTML5 introduced native <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code> elements, removing the need for third-party plugins like Flash that older sites relied on for embedding media. Both elements share a similar structure and a common attribute set for controlling playback behavior.`,
    sections: [
      {
        heading: 'The video and audio Elements',
        body: `<code>&lt;video&gt;</code> embeds a video file, and <code>&lt;audio&gt;</code> embeds a sound file; both accept one or more <code>&lt;source&gt;</code> child elements pointing to different file formats so the browser can pick the first one it supports. The <code>controls</code> attribute is essential for usability — without it, no play/pause/volume UI is shown at all, and the user has no way to interact with the media.`,
      },
      {
        heading: 'Common Attributes',
        body: `Beyond <code>controls</code>, several attributes shape playback behavior and should be used deliberately rather than by default.`,
        list: [
          '<code>autoplay</code> — starts playback automatically; generally discouraged for audio/video with sound, since most browsers block autoplay with sound unless the media is also muted.',
          '<code>muted</code> — starts the media muted; often combined with autoplay for background-style video.',
          '<code>loop</code> — restarts playback automatically when it ends.',
          '<code>poster</code> (video only) — an image shown before playback begins.',
        ],
      },
      {
        heading: 'Fallback Content',
        body: `Any text placed between the opening and closing <code>&lt;video&gt;</code> or <code>&lt;audio&gt;</code> tags is fallback content, shown only if the browser doesn't support the element at all. This is rarely an issue in modern browsers, but it's good practice to include a brief message and, ideally, a plain download link to the media file.`,
      },
    ],
    examples: [
      {
        caption: 'A video with multiple sources, controls, and fallback content',
        code: `<video controls width="640" height="360" poster="preview.jpg">
  <source src="tutorial.mp4" type="video/mp4">
  <source src="tutorial.webm" type="video/webm">
  Your browser does not support HTML video.
  <a href="tutorial.mp4">Download the video</a> instead.
</video>`,
        output: 'Displays a 640x360 video player showing a preview image before playback, with visible play/pause and volume controls; browsers without video support instead show the fallback text and a download link.',
      },
    ],
    commonMistakes: [
      'Omitting the controls attribute, leaving users with no way to play, pause, or adjust volume.',
      'Using autoplay with unmuted sound, which most modern browsers silently block anyway.',
      'Providing only a single video format/source, causing playback to fail in browsers that don\'t support that codec.',
      'Leaving out captions or transcripts for spoken content, which excludes deaf and hard-of-hearing users.',
    ],
    keyPoints: [
      'video and audio are native HTML5 elements requiring no third-party plugins.',
      'The controls attribute is required to give users a visible play/pause/volume interface.',
      'Multiple <source> elements let the browser pick a supported file format.',
      'autoplay with sound is generally blocked by browsers unless the media is also muted.',
    ],
  },

  'iframe-concepts': {
    title: 'HTML iframe Concepts',
    intro: `An <code>&lt;iframe&gt;</code> embeds another HTML document inside the current page, rendering it in its own independent browsing context. It's the mechanism behind embedded YouTube videos, Google Maps widgets, payment forms, and third-party embeds of all kinds.`,
    sections: [
      {
        heading: 'Common Use Cases',
        body: `Iframes are typically used to embed content that lives on a different domain or that needs to remain isolated from the host page — a video player, an interactive map, a social media post embed, or a third-party payment widget. Because the embedded document runs in its own context, its scripts and styles don't interfere with the host page's scripts and styles, and vice versa.`,
      },
      {
        heading: 'Security Considerations and Sandboxing',
        body: `Embedding third-party content inside an iframe introduces real security considerations, because the embedded page can, by default, run scripts, submit forms, and open popups. The <code>sandbox</code> attribute restricts what an embedded document is allowed to do, and using it with no value applies the strictest possible set of restrictions; specific permissions can then be re-enabled individually.`,
        list: [
          '<code>sandbox</code> (no value) — applies all restrictions: no scripts, no form submission, no popups, treats content as unique origin.',
          '<code>sandbox="allow-scripts"</code> — re-enables JavaScript execution inside the iframe.',
          '<code>sandbox="allow-same-origin"</code> — lets the embedded content be treated as being from its own origin rather than a unique, restricted one.',
          '<code>loading="lazy"</code> — defers loading the iframe until it\'s near the viewport, improving page load performance.',
        ],
      },
      {
        heading: 'Accessibility of Embedded Content',
        body: `Every <code>&lt;iframe&gt;</code> should include a <code>title</code> attribute describing its purpose (e.g. "Embedded YouTube video: Product Demo"), since screen readers announce this title when a user encounters the frame, giving them context before deciding whether to enter it.`,
      },
    ],
    examples: [
      {
        caption: 'A sandboxed, accessible video embed',
        code: `<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="Embedded YouTube video: Product demo"
  width="560"
  height="315"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allowfullscreen>
</iframe>`,
        output: 'Embeds a 560x315 YouTube video player within the page, loaded lazily as the user scrolls near it, restricted by the sandbox to only the explicitly allowed capabilities, and announced to screen readers as "Embedded YouTube video: Product demo."',
      },
    ],
    commonMistakes: [
      'Embedding third-party iframes with no sandbox attribute at all, granting the embedded content full, unrestricted capabilities.',
      'Forgetting the title attribute, leaving screen reader users with no context about what the frame contains.',
      'Loading many iframes eagerly on page load instead of using loading="lazy", hurting initial page performance.',
      'Assuming sandbox alone guarantees safety — it reduces risk but does not eliminate all concerns with fully untrusted content.',
    ],
    keyPoints: [
      'iframe embeds another document in an isolated browsing context, commonly used for videos, maps, and third-party widgets.',
      'The sandbox attribute restricts embedded content\'s capabilities; start with no value and re-enable only what\'s needed.',
      'Always add a descriptive title attribute for screen reader users.',
      'Use loading="lazy" to avoid loading off-screen iframes until needed.',
    ],
  },

  forms: {
    title: 'HTML Forms and Submission',
    intro: `Forms are how HTML collects information from users and sends it somewhere for processing — a login, a search box, a checkout page, or a contact form. The <code>&lt;form&gt;</code> element wraps all of these interactive controls and defines where and how their collected data is submitted.`,
    sections: [
      {
        heading: 'The action and method Attributes',
        body: `<code>action</code> specifies the URL that receives the submitted form data; if omitted, the form submits to the current page's own URL. <code>method</code> specifies the HTTP method used: <code>GET</code> appends form data as a visible query string in the URL (suitable for searches or non-sensitive filters), while <code>POST</code> sends data in the request body, which is required for anything that changes server state or contains sensitive information like passwords.`,
      },
      {
        heading: 'The Submission Flow',
        body: `When a user activates a submit control (typically a <code>&lt;button type="submit"&gt;</code> or <code>&lt;input type="submit"&gt;</code>) inside a form, the browser first runs any native validation on the fields (like <code>required</code> or <code>pattern</code>), and if all fields pass, it gathers each control's <code>name</code>/value pair and sends the request to <code>action</code> using <code>method</code>. If validation fails, submission is blocked and the browser highlights the first invalid field.`,
        list: [
          'Every field that should be submitted needs a <code>name</code> attribute — without it, its value is not included in the submitted data.',
          '<code>GET</code> — data visible in the URL, bookmarkable, appropriate for searches.',
          '<code>POST</code> — data sent in the request body, appropriate for sensitive or state-changing submissions.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A basic contact form submitting via POST',
        code: `<form action="/submit-contact" method="POST">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" required>

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send Message</button>
</form>`,
        output: 'Displays a text field and a textarea with a Send Message button; clicking it validates that both fields are filled in, then sends a POST request to /submit-contact with name and message values in the request body.',
      },
    ],
    commonMistakes: [
      'Forgetting the name attribute on inputs, so their values are silently excluded from the submitted data.',
      'Using GET for forms that submit sensitive data like passwords, exposing it in the URL and browser history.',
      'Omitting the action attribute unintentionally and being surprised the form submits back to the same page.',
      'Using a plain <div> or <span> with a click handler instead of a real submit button, breaking default form submission and keyboard behavior (like submitting on Enter).',
    ],
    keyPoints: [
      'The form element wraps input controls and defines where (action) and how (method) they are submitted.',
      'GET exposes data in the URL; POST sends it in the request body — use POST for sensitive or state-changing data.',
      'Every field needs a name attribute to be included in the submitted data.',
      'Native validation runs before submission and blocks it if required fields or patterns fail.',
    ],
  },

  inputs: {
    title: 'HTML Input Types and Labels',
    intro: `The <code>&lt;input&gt;</code> element is the most versatile form control in HTML, and its behavior changes entirely based on its <code>type</code> attribute. Choosing the right input type is not cosmetic — it changes the on-screen keyboard shown on mobile devices, enables built-in validation, and improves accessibility.`,
    sections: [
      {
        heading: 'Common Input Types',
        body: `HTML defines many input types beyond the generic text box, each tailored to a specific kind of data.`,
        list: [
          '<code>text</code> — a single-line free text field.',
          '<code>email</code> — validates a basic email address pattern and shows an email-optimized mobile keyboard.',
          '<code>password</code> — masks entered characters.',
          '<code>number</code> — accepts only numeric input, often paired with step, min, and max.',
          '<code>checkbox</code> — an independent on/off toggle; multiple checkboxes with the same name can all be checked at once.',
          '<code>radio</code> — one selection from a mutually exclusive group; radios sharing the same name attribute form a single group.',
          '<code>date</code>, <code>tel</code>, <code>url</code>, <code>search</code>, <code>file</code> — specialized inputs for dates, phone numbers, URLs, search queries, and file uploads.',
        ],
      },
      {
        heading: 'Associating Labels with Inputs',
        body: `Every input needs an associated <code>&lt;label&gt;</code> to be usable and accessible. The most reliable way is connecting a label's <code>for</code> attribute to the input's <code>id</code> — this lets clicking the label text focus (or toggle) the input, and lets screen readers announce the label when the input receives focus. Wrapping the input directly inside the label element is a valid alternative that doesn't require matching id/for values.`,
      },
    ],
    examples: [
      {
        caption: 'Various input types with properly associated labels',
        code: `<label for="email">Email Address</label>
<input type="email" id="email" name="email">

<label for="age">Age</label>
<input type="number" id="age" name="age" min="1" max="120">

<fieldset>
  <legend>Preferred Contact Method</legend>
  <label><input type="radio" name="contact" value="email" checked> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>`,
        output: 'Renders an email field with an email-style mobile keyboard, a number field restricted between 1 and 120, and a radio button group where selecting one option automatically deselects the other.',
      },
    ],
    commonMistakes: [
      'Using type="text" for every field instead of purpose-built types like email, number, or tel.',
      'Leaving out <label> elements entirely, relying only on placeholder text, which disappears once the user starts typing and isn\'t reliably read by all screen readers.',
      'Giving radio buttons in the same logical group different name attributes, breaking the mutual-exclusivity behavior.',
      'Mismatching a label\'s for attribute with the input\'s id (or a typo in either), silently breaking the association.',
    ],
    keyPoints: [
      'The type attribute determines an input\'s behavior, validation, and mobile keyboard.',
      'Radio buttons sharing the same name form one mutually exclusive group; checkboxes are independent.',
      'Always associate a label with its input via matching for/id, or by wrapping the input in the label.',
      'Use fieldset and legend to group and describe related controls like a set of radio buttons.',
    ],
  },

  validation: {
    title: 'HTML Form Validation',
    intro: `Modern HTML provides built-in, native form validation through attributes on input elements, letting browsers catch many common input errors before any JavaScript or server-side code runs. This is not a replacement for server-side validation — client-side checks can always be bypassed — but it provides fast, accessible feedback for legitimate users.`,
    sections: [
      {
        heading: 'Core Validation Attributes',
        body: `A handful of attributes cover most everyday validation needs without writing a single line of JavaScript.`,
        list: [
          '<code>required</code> — the field must have a value before the form can be submitted.',
          '<code>pattern</code> — the value must match a given regular expression (e.g. <code>pattern="[0-9]{5}"</code> for a 5-digit ZIP code).',
          '<code>min</code> / <code>max</code> — set the minimum and maximum allowed values for number, date, and range inputs.',
          '<code>minlength</code> / <code>maxlength</code> — constrain the number of characters allowed in text-based fields.',
        ],
      },
      {
        heading: 'How the Browser Surfaces Errors',
        body: `When a form is submitted with invalid fields, the browser blocks submission, focuses the first invalid field, and shows a small built-in tooltip describing the problem (e.g. "Please fill out this field"). Invalid fields also automatically match the CSS <code>:invalid</code> pseudo-class, which developers commonly use to add a red border or warning icon without any JavaScript.`,
      },
      {
        heading: 'Native Validation Is Not Enough Alone',
        body: `Because all client-side validation, including HTML's built-in attributes, can be bypassed by disabling JavaScript, editing HTML through developer tools, or sending requests directly to the server, every value must also be validated and sanitized again on the server before it's trusted or stored. Native HTML validation exists to improve user experience with instant feedback, not to serve as a security boundary.`,
      },
    ],
    examples: [
      {
        caption: 'A form field using several native validation attributes together',
        code: `<label for="zip">ZIP Code</label>
<input
  type="text"
  id="zip"
  name="zip"
  required
  pattern="[0-9]{5}"
  maxlength="5"
  title="Enter a 5-digit ZIP code">

<label for="quantity">Quantity</label>
<input type="number" id="quantity" name="quantity" min="1" max="10" required>`,
        output: 'If the form is submitted with the ZIP field empty or not matching exactly 5 digits, the browser blocks submission and shows a validation message near that field; the quantity field similarly rejects values below 1 or above 10.',
      },
    ],
    commonMistakes: [
      'Relying only on client-side validation and skipping server-side validation entirely.',
      'Writing an overly strict or incorrect pattern regular expression that rejects legitimately valid input.',
      'Forgetting to add a helpful title attribute alongside pattern, leaving users with a generic, unhelpful error message.',
      'Assuming required alone is sufficient for fields that also need format checking, like email or ZIP code fields.',
    ],
    keyPoints: [
      'required, pattern, min/max, and minlength/maxlength provide validation without any JavaScript.',
      'The browser blocks submission and shows a built-in message when validation fails.',
      'Invalid fields match the :invalid CSS pseudo-class, useful for custom styling.',
      'Client-side validation improves UX only — server-side validation is always still required.',
    ],
  },

  accessibility: {
    title: 'HTML Accessibility Fundamentals',
    intro: `Accessibility means building pages that people using screen readers, keyboard-only navigation, voice control, or other assistive technology can use just as effectively as anyone else. Much of accessibility isn't a separate skill layered on top of HTML — it's simply the result of writing correct, semantic HTML in the first place.`,
    sections: [
      {
        heading: 'Semantic Structure as the Accessibility Foundation',
        body: `Screen readers build a navigable model of a page from its underlying structure: heading levels, landmark elements (<code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>), lists, and form labels. A page built from correctly chosen semantic elements is, by default, far more accessible than one built entirely from generic <code>&lt;div&gt;</code> and <code>&lt;span&gt;</code> elements with visual styling standing in for structure.`,
      },
      {
        heading: 'Text Alternatives and ARIA Basics',
        body: `Every meaningful image needs descriptive <code>alt</code> text, as covered in HTML images. When native HTML elements and attributes can't fully express a UI pattern's role or state — a custom tab widget or an expandable accordion, for example — ARIA (Accessible Rich Internet Applications) attributes like <code>role</code>, <code>aria-label</code>, and <code>aria-expanded</code> can fill the gap. The first rule of ARIA, though, is to prefer a native HTML element over an ARIA-patched generic one whenever possible — a real <code>&lt;button&gt;</code> is more robust than a <code>&lt;div role="button"&gt;</code> that must have keyboard handling added manually.`,
        list: [
          '<code>alt</code> — required text alternative for meaningful images.',
          '<code>aria-label</code> — provides an accessible name when visible text isn\'t sufficient or present.',
          '<code>aria-expanded</code> — communicates whether a collapsible element is currently open or closed.',
          '<code>role</code> — declares an element\'s purpose when no native element expresses it, used sparingly.',
        ],
      },
      {
        heading: 'Keyboard Navigation',
        body: `Every interactive element — links, buttons, form controls — must be reachable and operable using only a keyboard, without requiring a mouse. Native elements like <code>&lt;a&gt;</code>, <code>&lt;button&gt;</code>, and <code>&lt;input&gt;</code> handle this automatically (they're focusable via Tab and activatable via Enter or Space by default). Custom interactive widgets built from non-interactive elements lose this behavior entirely unless it's added back manually, which is another strong reason to prefer native elements.`,
      },
    ],
    examples: [
      {
        caption: 'An accessible expandable section using native elements and minimal ARIA',
        code: `<button aria-expanded="false" aria-controls="details-panel" id="toggle-btn">
  Show Details
</button>
<div id="details-panel" hidden>
  <p>Additional details appear here once expanded.</p>
</div>`,
        output: 'Displays a "Show Details" button; when JavaScript toggles aria-expanded to "true" and removes the hidden attribute, screen readers announce the button as expanded and the panel content becomes available to all users, including keyboard users tabbing to the button.',
      },
    ],
    commonMistakes: [
      'Using a <div> or <span> with a click handler as a button instead of a real <button>, breaking keyboard access.',
      'Adding ARIA roles to elements that already have the correct native semantics, which is redundant and sometimes conflicting.',
      'Leaving alt attributes empty or missing on meaningful images.',
      'Building custom widgets (dropdowns, modals, tabs) without any keyboard handling, trapping keyboard-only users.',
    ],
    keyPoints: [
      'Correct semantic HTML is the foundation of accessibility, often requiring no extra ARIA at all.',
      'Prefer native interactive elements (button, a, input) over ARIA-patched generic divs.',
      'Every interactive element must be operable via keyboard alone.',
      'ARIA attributes like aria-label and aria-expanded fill gaps native HTML can\'t express, but should be used sparingly.',
    ],
  },

  'seo-basics': {
    title: 'HTML SEO Basics',
    intro: `Search Engine Optimization (SEO) is heavily influenced by how a page is structured in HTML, long before any external marketing tactics come into play. Search engines crawl and parse raw HTML to understand what a page is about, and clean, semantic markup gives them clearer signals than messy, generic markup does.`,
    sections: [
      {
        heading: 'The Title Tag and Meta Description',
        body: `The <code>&lt;title&gt;</code> element is one of the strongest on-page SEO signals available — it should be unique per page and concisely describe that page's specific content, not just the site's name repeated everywhere. The meta description doesn't directly influence ranking algorithms, but it strongly shapes the click-through rate from search results, since it's usually the summary text shown beneath the title in a search listing.`,
      },
      {
        heading: 'Heading Structure and Content Signals',
        body: `A single, descriptive <code>&lt;h1&gt;</code> that clearly states the page's main topic, followed by a logical hierarchy of <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code> subheadings, helps search engines understand a page's topic structure — much like it helps screen reader users navigate it. Content wrapped in genuinely semantic elements like <code>&lt;article&gt;</code> and <code>&lt;main&gt;</code>, rather than an undifferentiated sea of <code>&lt;div&gt;</code> tags, gives crawlers stronger signals about which content is the primary substance of the page versus supporting material like navigation.`,
      },
      {
        heading: 'Other Markup That Affects SEO',
        body: `A few additional HTML details consistently affect how well a page performs in search results.`,
        list: [
          'Descriptive <code>alt</code> text on images, which search engines index and can surface in image search results.',
          'Descriptive link text ("Read our pricing guide") instead of vague text ("click here"), which helps search engines understand the linked page\'s topic.',
          'A canonical URL (<code>&lt;link rel="canonical" href="..."&gt;</code>) to avoid duplicate content issues when the same content is reachable at multiple URLs.',
        ],
      },
    ],
    examples: [
      {
        caption: 'SEO-relevant head and body markup on a single page',
        code: `<head>
  <title>Beginner HTML Tutorial — Webnest Studio</title>
  <meta name="description" content="Learn HTML fundamentals step by step, from document structure to accessible forms.">
  <link rel="canonical" href="https://webnest.example.com/tutorials/html">
</head>
<body>
  <h1>Beginner HTML Tutorial</h1>
  <article>
    <h2>What You'll Learn</h2>
    <p>Read our <a href="/tutorials/css">CSS tutorial</a> next.</p>
  </article>
</body>`,
        output: 'Search engines index a unique, descriptive title and summary for this page, associate the canonical URL as the authoritative version, and understand from the h1/h2 structure and article wrapper that this page\'s primary topic is a beginner HTML tutorial.',
      },
    ],
    commonMistakes: [
      'Using the same generic <title> on every page of a site instead of a unique, descriptive one per page.',
      'Writing vague link text like "click here" instead of descriptive text that conveys the destination\'s topic.',
      'Stuffing keywords unnaturally into headings or alt text instead of writing for genuine readability.',
      'Leaving duplicate content reachable at multiple URLs without a canonical link, splitting SEO value between them.',
    ],
    keyPoints: [
      'The <title> element and heading structure are strong, direct signals of a page\'s topic to search engines.',
      'The meta description influences click-through rate from search results, not ranking directly.',
      'Semantic elements (article, main) and descriptive alt/link text give crawlers clearer content signals.',
      'A canonical link tag prevents duplicate-content dilution when content is reachable at multiple URLs.',
    ],
  },

  'best-practices': {
    title: 'HTML Best Practices',
    intro: `Writing HTML that "works" in a browser is a low bar — writing HTML that's clean, maintainable, accessible, and easy for other developers (or your future self) to read is a different standard entirely. A handful of consistent habits separate professional-quality markup from markup that merely renders correctly by accident.`,
    sections: [
      {
        heading: 'Consistent Indentation and Formatting',
        body: `Nested elements should be indented consistently (commonly two or four spaces) so that the document's structure is visually obvious just by scanning it. Inconsistent or absent indentation makes it much harder to spot mismatched or improperly nested tags at a glance, especially as a page grows.`,
      },
      {
        heading: 'Always Close Tags Properly',
        body: `Every element that requires a closing tag should have one, closed in the correct order relative to other open tags. Void elements like <code>&lt;img&gt;</code>, <code>&lt;br&gt;</code>, and <code>&lt;input&gt;</code> have no closing tag at all and shouldn't be given one. Relying on a browser's error-correcting behavior to "fix" unclosed or mismatched tags produces markup that is fragile and can render differently across different browsers or parsers.`,
      },
      {
        heading: 'Avoid Inline Styles',
        body: `Inline <code>style</code> attributes mix presentation directly into structural markup, making styles harder to reuse, override, and maintain consistently across a site. Styling should live in external or embedded CSS using classes, which keeps HTML focused purely on structure and content, and lets a single style rule apply consistently everywhere it's needed.`,
        list: [
          'Prefer class-based CSS selectors over inline style attributes for anything beyond a one-off, temporary tweak.',
          'Keep structural markup (HTML) and presentation (CSS) in separate concerns wherever practical.',
        ],
      },
      {
        heading: 'Validate Your Markup',
        body: `Running HTML through a validator (such as the W3C Markup Validation Service) catches structural errors — unclosed tags, invalid nesting, duplicate IDs, missing required attributes — that might otherwise render "fine" in one browser today but break unpredictably in another browser or a future version. Validating markup regularly, especially before shipping a page, catches these issues while they're still cheap to fix.`,
      },
    ],
    examples: [
      {
        caption: 'Clean, consistently formatted markup with no inline styles',
        code: `<section class="pricing-card">
  <h2 class="pricing-card__title">Pro Plan</h2>
  <p class="pricing-card__price">$15/month</p>
  <ul class="pricing-card__features">
    <li>100 GB storage</li>
    <li>Priority support</li>
  </ul>
</section>`,
        output: 'Renders a pricing card section whose visual appearance is entirely controlled by an external stylesheet targeting the pricing-card classes, keeping the HTML readable, consistently indented, and free of inline style attributes.',
      },
    ],
    commonMistakes: [
      'Using inline style attributes scattered across many elements instead of reusable CSS classes.',
      'Leaving tags unclosed or improperly nested and relying on the browser to silently correct them.',
      'Inconsistent or missing indentation, making the document structure hard to scan visually.',
      'Never running markup through a validator, letting small structural errors accumulate unnoticed.',
    ],
    keyPoints: [
      'Consistent indentation makes nested structure easy to scan and debug.',
      'Close every tag that requires closing, in the correct nested order; never close void elements like img or br.',
      'Keep styling in CSS classes rather than inline style attributes.',
      'Regularly validate markup with a tool like the W3C Markup Validation Service to catch structural errors early.',
    ],
  },
}
