// CSS module — hand-written lesson content.
// Keys are the fixed topic slugs used by the CSS learning module.
export const cssContent = {
  selectors: {
    title: 'CSS Selectors',
    intro: `A selector is the part of a CSS rule that tells the browser which HTML elements a set of styles should apply to. Every rule you write starts with a selector, followed by a declaration block wrapped in curly braces, and choosing the right selector is what separates precise, maintainable stylesheets from fragile ones.

CSS ships with several selector categories — type (element), class, ID, attribute, and combinators that describe relationships between elements. Understanding how each one targets the DOM, and how they can be combined, is the foundation for everything else in CSS, including the cascade and specificity rules covered later in this module.`,
    sections: [
      {
        heading: 'Basic Selector Types',
        body: `The four most common selectors form the backbone of nearly every stylesheet.`,
        list: [
          '<strong>Type (element) selector</strong> — targets every instance of an HTML tag, e.g. <code>p { }</code> styles all paragraphs.',
          '<strong>Class selector</strong> — starts with a dot and targets any element carrying that class, e.g. <code>.card { }</code>. Classes are reusable across many elements.',
          '<strong>ID selector</strong> — starts with a hash and targets the single element with that <code>id</code> attribute, e.g. <code>#header { }</code>. IDs must be unique per page.',
          '<strong>Universal selector</strong> — the asterisk <code>*</code> matches every element, often used for resets like <code>* { box-sizing: border-box; }</code>.',
        ],
      },
      {
        heading: 'Attribute Selectors',
        body: `Attribute selectors match elements based on the presence or value of an HTML attribute, using square brackets. <code>[disabled]</code> matches any element with a "disabled" attribute regardless of value, while <code>[type="email"]</code> matches only elements whose "type" attribute equals "email" exactly. Partial-match operators add flexibility: <code>[class^="btn-"]</code> matches values that start with "btn-", <code>[class$="-icon"]</code> matches values ending in "-icon", and <code>[class*="nav"]</code> matches values containing "nav" anywhere.`,
      },
      {
        heading: 'Combinators',
        body: `Combinators describe the relationship between two selectors rather than matching an isolated element.`,
        list: [
          '<strong>Descendant combinator</strong> (space) — <code>article p</code> selects any &lt;p&gt; nested anywhere inside an &lt;article&gt;, at any depth.',
          '<strong>Child combinator</strong> (<code>&gt;</code>) — <code>ul &gt; li</code> selects only &lt;li&gt; elements that are direct children of a &lt;ul&gt;, not grandchildren.',
          '<strong>Adjacent sibling combinator</strong> (<code>+</code>) — <code>h2 + p</code> selects a &lt;p&gt; that immediately follows an &lt;h2&gt; at the same nesting level.',
          '<strong>General sibling combinator</strong> (<code>~</code>) — <code>h2 ~ p</code> selects every &lt;p&gt; that shares a parent with an &lt;h2&gt; and comes after it, not just the first one.',
        ],
      },
      {
        heading: 'Grouping Selectors',
        body: `A comma lets you apply the same declaration block to multiple, unrelated selectors without repeating yourself: <code>h1, h2, h3 { font-family: sans-serif; }</code> applies the same font to all three heading levels in a single rule.`,
      },
    ],
    examples: [
      {
        caption: 'Combining class, attribute, and combinator selectors',
        code: `<!-- HTML context -->
<!--
<nav class="site-nav">
  <a href="/">Home</a>
  <a href="/about" class="active">About</a>
</nav>
<form>
  <input type="email" required>
</form>
-->

.site-nav > a {
  color: #333;
  text-decoration: none;
}

.site-nav > a.active {
  font-weight: bold;
  color: #0057d9;
}

input[type="email"][required] {
  border: 1px solid #d9534f;
}`,
        output: 'Direct-child nav links are unstyled by default, the "active" link is bold and blue, and any required email input gets a red border to flag it as mandatory.',
      },
      {
        caption: 'Descendant vs. child combinator behaving differently on nested lists',
        code: `<!--
<ul class="menu">
  <li>Item 1
    <ul><li>Sub-item</li></ul>
  </li>
  <li>Item 2</li>
</ul>
-->

.menu li { color: black; }        /* matches ALL li, including nested */
.menu > li { font-weight: bold; } /* matches only the two top-level li */`,
        output: 'Every list item (including the nested sub-item) is black, but only the two direct children of .menu ("Item 1" and "Item 2") appear bold.',
      },
    ],
    commonMistakes: [
      'Reaching for an ID selector for reusable styling, then being unable to reuse the rule anywhere else on the page since IDs must be unique.',
      'Confusing the child combinator (>) with the descendant combinator (space), leading to styles unexpectedly applying to deeply nested elements.',
      'Forgetting that attribute selectors are case-sensitive for attribute values by default, which can silently break matches like [lang="EN"] against lang="en".',
      'Overusing the universal selector (*) in performance-sensitive rules, which forces the browser to evaluate the rule against every single element in the DOM.',
    ],
    keyPoints: [
      'Type, class, ID, and universal selectors are the four basic building blocks of CSS targeting.',
      'Attribute selectors ([attr], [attr="value"], [attr^=], [attr$=], [attr*=]) match based on HTML attributes.',
      'Combinators (space, >, +, ~) express relationships between elements rather than matching a single one in isolation.',
      'Grouping selectors with commas lets one declaration block apply to multiple unrelated selectors.',
    ],
  },

  cascade: {
    title: 'Understanding the CSS Cascade',
    intro: `The "C" in CSS stands for Cascading, and it describes the algorithm the browser uses to decide which declaration wins when multiple rules target the same element and the same property. Without the cascade, a stylesheet with conflicting rules would be ambiguous — the cascade makes the outcome predictable.

The cascade resolves conflicts through a strict, ordered sequence: first by origin and importance, then by specificity (covered in the next topic), and finally by source order. Learning this order removes the guesswork from debugging "why isn't my style applying?" — usually the answer lives somewhere in this sequence.`,
    sections: [
      {
        heading: 'Origin and Importance',
        body: `CSS declarations come from different origins, and the cascade ranks them before it even looks at specificity.`,
        list: [
          '<strong>User-agent styles</strong> — the browser\'s built-in default stylesheet (e.g. default margins on &lt;body&gt;, default list bullets).',
          '<strong>Author styles</strong> — the CSS you write for your site; this is what developers work with day to day.',
          '<strong>User styles</strong> — custom styles a site visitor applies (e.g. via browser extensions or accessibility settings).',
          '<strong>!important declarations</strong> — override normal cascade ordering for that specific origin, and author !important rules beat normal author rules regardless of specificity elsewhere.',
        ],
      },
      {
        heading: 'Source Order as a Tie-Breaker',
        body: `When two rules have identical origin, importance, and specificity, the cascade falls back to source order: whichever rule appears later in the stylesheet (or later in the document, for multiple linked stylesheets) wins. This is why the order you write or link your CSS files matters — a later rule with equal specificity silently overrides an earlier one.`,
      },
      {
        heading: 'Inheritance vs. the Cascade',
        body: `Inheritance is a separate but related mechanism: some properties (like color, font-family, and line-height) automatically pass from a parent element to its children if nothing else sets them. Properties like margin, padding, and border do not inherit by default. An inherited value has the lowest priority in the cascade, so any explicit rule — no matter how simple — will override an inherited one.`,
      },
    ],
    examples: [
      {
        caption: 'Source order deciding the outcome between equally specific rules',
        code: `<!-- <p class="note">Read this carefully.</p> -->

.note {
  color: blue;
}

.note {
  color: green; /* same specificity, appears later -> wins */
}`,
        output: 'The paragraph text renders green, because the second .note rule has identical specificity to the first but appears later in the stylesheet.',
      },
      {
        caption: 'An !important declaration overriding a more specific selector',
        code: `#sidebar .widget p {
  color: black;
}

p {
  color: red !important; /* wins despite lower specificity, due to !important */
}`,
        output: 'All paragraph text renders red, including text inside #sidebar .widget, because !important outranks normal specificity comparisons within the author origin.',
      },
    ],
    commonMistakes: [
      'Reaching for !important to "fix" a styling conflict instead of understanding why the conflicting rule was winning in the first place, which creates a stack of increasingly hard-to-override overrides.',
      'Assuming that a rule later in the file always wins, forgetting that specificity is checked before source order.',
      'Expecting non-inherited properties like border or padding to pass down from a parent element automatically.',
      'Linking two stylesheets in the wrong order and being confused when the "correct" rule gets silently overridden by an equally specific rule from the other file.',
    ],
    keyPoints: [
      'The cascade resolves conflicts in this order: origin and importance, then specificity, then source order.',
      'Author !important declarations override normal author-origin rules regardless of specificity.',
      'When specificity and origin are tied, the declaration that appears later in the source wins.',
      'Inheritance is separate from the cascade and only applies to certain properties; inherited values have the lowest cascade priority.',
    ],
  },

  specificity: {
    title: 'CSS Specificity',
    intro: `Specificity is the scoring system the browser uses to decide which selector "wins" when two rules of the same origin and importance target the same element with conflicting declarations. The higher-specificity selector's declaration is applied, regardless of which rule was written first.

Specificity is calculated, not guessed — it follows a concrete, comparable formula. Learning to calculate it by hand removes almost all of the mystery around "why isn't my CSS working," which is one of the most common frustrations for developers new to the language.`,
    sections: [
      {
        heading: 'The Specificity Hierarchy',
        body: `Specificity is commonly represented as a tuple of four values, often written as (a, b, c, d), compared left to right like version numbers.`,
        list: [
          '<strong>Inline styles</strong> (style="...") — highest specificity, effectively (1, 0, 0, 0). Beats any selector in an external or internal stylesheet.',
          '<strong>ID selectors</strong> — each contributes (0, 1, 0, 0). One ID always outweighs any number of classes.',
          '<strong>Class, attribute, and pseudo-class selectors</strong> — each contributes (0, 0, 1, 0). Examples: .card, [type="text"], :hover.',
          '<strong>Type selectors and pseudo-elements</strong> — each contributes (0, 0, 0, 1). Examples: div, p, ::before.',
        ],
      },
      {
        heading: 'Calculating and Comparing Specificity',
        body: `To score a selector, count how many of each category it contains, then compare tuples left to right — a single ID beats any number of classes, and a single class beats any number of type selectors. The universal selector (*) and combinators (>, +, ~, space) add no specificity value at all. For example, <code>#nav .link</code> scores (0,1,1,0) while <code>nav ul li a</code> scores (0,0,0,4) — the first wins even though the second selector has more parts written out.`,
      },
      {
        heading: 'A Concrete Conflict Example',
        body: `Given <code>.button { color: blue; }</code> and <code>#submit-btn { color: red; }</code> both targeting the same button, the ID rule wins and the button renders red — its specificity (0,1,0,0) beats the class rule's (0,0,1,0), even if the class rule appears later in the file. If a third rule <code>button { color: green; }</code> is added, it loses to both, since a bare type selector has the lowest specificity of the three.`,
      },
    ],
    examples: [
      {
        caption: 'Specificity determining the winner regardless of source order',
        code: `<!-- <button id="submit-btn" class="button">Submit</button> -->

button {
  color: green;           /* specificity (0,0,0,1) */
}

.button {
  color: blue;             /* specificity (0,0,1,0) */
}

#submit-btn {
  color: red;               /* specificity (0,1,0,0) -- wins */
}`,
        output: 'The button text renders red because the ID selector has the highest specificity of the three competing rules, even though it targets the same element as the others.',
      },
      {
        caption: 'Combined selectors adding up specificity points',
        code: `nav ul li a.active {
  /* type(4) + class(1) = (0,0,1,4) */
  color: orange;
}

.nav-list .active {
  /* class(2) = (0,0,2,0) -- higher, wins over the rule above */
  color: purple;
}`,
        output: 'The active navigation link renders purple, since two class selectors (0,0,2,0) outrank one class plus four type selectors (0,0,1,4) — the class column is compared first and 2 beats 1.',
      },
    ],
    commonMistakes: [
      'Assuming a selector with "more parts" automatically wins, when specificity actually compares category counts (IDs, then classes, then types) rather than raw selector length.',
      'Overusing ID selectors for styling, which creates specificity so high that later, more maintainable class-based rules become impossible to override without another ID or !important.',
      'Forgetting that combinators (>, +, ~, and the descendant space) contribute zero specificity themselves.',
      'Fighting a specificity conflict with !important instead of simplifying the competing selector, which compounds the problem for future changes.',
    ],
    keyPoints: [
      'Specificity is scored as a tuple: inline styles > IDs > classes/attributes/pseudo-classes > type selectors/pseudo-elements.',
      'Higher specificity wins regardless of source order; equal specificity falls back to source order.',
      'Combinators and the universal selector add no specificity value on their own.',
      'Prefer low, consistent specificity (mostly classes) to keep a stylesheet easy to override and maintain.',
    ],
  },

  'box-model': {
    title: 'The CSS Box Model',
    intro: `Every element rendered on a web page is treated by the browser as a rectangular box, and the CSS box model describes exactly how that box's size is calculated from its content outward. Mastering the box model is essential — it explains why elements sometimes overflow their containers, why margins seem to "collapse," and why two elements with the same declared width can render at different actual sizes.

The box model has four layers, from the inside out: content, padding, border, and margin. Each layer adds space around the one before it, and the box-sizing property controls whether padding and border are included in or added to a declared width.`,
    sections: [
      {
        heading: 'The Four Layers',
        body: `Understanding each layer individually makes the full box easy to reason about.`,
        list: [
          '<strong>Content</strong> — the actual text, image, or other content, sized by width and height.',
          '<strong>Padding</strong> — transparent space between the content and the border; it is part of the element\'s background.',
          '<strong>Border</strong> — a visible (or invisible) line that wraps the padding and content, set with border-width, border-style, and border-color.',
          '<strong>Margin</strong> — transparent space outside the border, separating the element from its neighbors; margins can collapse vertically between adjacent block elements.',
        ],
      },
      {
        heading: 'content-box vs. border-box',
        body: `By default, box-sizing: content-box means width and height apply only to the content area — padding and border are added on top, making the element's total rendered size larger than the declared width. box-sizing: border-box changes this so that width and height include padding and border, meaning the content area shrinks to fit while the total box stays exactly the declared size. Most modern stylesheets set <code>* { box-sizing: border-box; }</code> globally because it makes sizing far more predictable, especially in layouts that mix padding, borders, and percentage widths.`,
      },
      {
        heading: 'Margin Collapsing',
        body: `Vertical margins between two adjacent block-level elements collapse into a single margin equal to the larger of the two, rather than adding together. Horizontal margins never collapse. This behavior surprises many beginners: two stacked paragraphs each with margin: 20px 0 end up with only 20px between them, not 40px.`,
      },
    ],
    examples: [
      {
        caption: 'content-box vs. border-box changing the rendered size of identical width declarations',
        code: `.card-content-box {
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  box-sizing: content-box; /* total rendered width = 300 + 40 + 10 = 350px */
}

.card-border-box {
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  box-sizing: border-box; /* total rendered width stays exactly 300px */
}`,
        output: 'The content-box card renders 350px wide overall, while the border-box card renders exactly 300px wide, with its content area shrinking to accommodate the padding and border.',
      },
      {
        caption: 'Margin collapsing between stacked paragraphs',
        code: `<!--
<p>First paragraph.</p>
<p>Second paragraph.</p>
-->

p {
  margin: 20px 0;
}`,
        output: 'The visible gap between the two paragraphs is only 20px, not 40px, because the adjacent vertical margins collapse into the larger of the two values.',
      },
    ],
    commonMistakes: [
      'Setting width: 300px on an element with padding and a border under the default content-box model, then being confused when it renders wider than 300px.',
      'Adding vertical margin to both a parent and its first child and expecting the space to stack, without accounting for margin collapsing.',
      'Forgetting to reset box-sizing globally, causing a mix of content-box and border-box elements to size inconsistently across a layout.',
      'Confusing padding (inside the border, part of the background) with margin (outside the border, always transparent).',
    ],
    keyPoints: [
      'Every element is a box made of content, padding, border, and margin, from the inside out.',
      'box-sizing: content-box adds padding and border on top of the declared width; border-box includes them within it.',
      'Adjacent vertical margins collapse to the larger single value rather than summing; horizontal margins never collapse.',
      'Setting box-sizing: border-box globally is a common, highly recommended reset for predictable sizing.',
    ],
  },

  units: {
    title: 'CSS Units of Measurement',
    intro: `CSS offers several categories of units for sizing elements, spacing, and typography, and choosing the right one has a direct impact on how well a layout adapts across devices. Units broadly split into absolute units, which always represent the same physical size, and relative units, which scale based on some other value like the parent's font size or the viewport.

Modern, responsive CSS leans heavily on relative units — em, rem, %, vw, and vh — because they let layouts and text scale gracefully with user preferences (like a larger default browser font size) and different screen sizes, without a developer needing to hardcode a value for every breakpoint.`,
    sections: [
      {
        heading: 'Absolute Units',
        body: `<code>px</code> (pixels) is the only absolute unit used in everyday CSS. A pixel does not scale with the user's font-size settings, which makes it predictable for things like borders and box-shadows, but less ideal for text, since it ignores user accessibility preferences set at the browser level.`,
      },
      {
        heading: 'Relative Units Based on Font Size',
        body: `<code>em</code> is relative to the font-size of the current element (or its parent, when used for font-size itself), which means em values can compound unpredictably when nested. <code>rem</code> ("root em") is relative to the font-size of the root &lt;html&gt; element only, so it never compounds — this makes rem the preferred unit for consistent, predictable spacing and typography across a whole site.`,
      },
      {
        heading: 'Percentage and Viewport Units',
        body: `<code>%</code> sizes an element relative to its containing block (usually the parent), which is common for fluid widths like <code>width: 50%</code>. Viewport units size relative to the browser window itself: <code>vw</code> is 1% of the viewport width, and <code>vh</code> is 1% of the viewport height — useful for full-screen sections (<code>height: 100vh</code>) or text that scales with screen size.`,
      },
      {
        heading: 'Choosing the Right Unit',
        body: `A practical rule of thumb: use rem for font-size and consistent spacing (margin, padding, gap), use % for fluid container widths, use vw/vh sparingly for full-viewport sections or hero text, and reserve px for things that genuinely should not scale, like a 1px border or a small fixed icon.`,
      },
    ],
    examples: [
      {
        caption: 'rem staying consistent while nested em compounds unexpectedly',
        code: `html { font-size: 16px; }

.parent { font-size: 1.5em; }       /* 16px * 1.5 = 24px */
.parent .child { font-size: 1.5em; } /* 24px * 1.5 = 36px, compounding! */

.parent .child-rem { font-size: 1.5rem; } /* always 16px * 1.5 = 24px */`,
        output: 'The nested .child element renders at 36px because em compounds through each nesting level, while .child-rem stays at a predictable 24px regardless of nesting depth.',
      },
      {
        caption: 'A full-viewport hero section using vh alongside a fluid width in percent',
        code: `.hero {
  width: 100%;
  height: 100vh;
  padding: 2rem;
  font-size: clamp(1.5rem, 4vw, 3rem);
}`,
        output: 'The hero section fills the full height of the browser window and the full width of its container, while the heading text scales smoothly between 1.5rem and 3rem depending on viewport width.',
      },
    ],
    commonMistakes: [
      'Using em for font-size on deeply nested elements without realizing the value compounds with each ancestor, producing unexpectedly large or small text.',
      'Hardcoding font sizes in px, which ignores a user\'s browser-level font-size preference and can hurt accessibility.',
      'Using 100vh on mobile browsers and being surprised when it exceeds the visible area due to dynamically appearing address bars.',
      'Setting a percentage width on an element whose parent has no defined size, resulting in unexpected or collapsed dimensions.',
    ],
    keyPoints: [
      'px is an absolute unit; em, rem, %, vw, and vh are relative units that scale based on context.',
      'rem is relative only to the root font-size and never compounds, unlike em.',
      '% sizes relative to the containing block; vw/vh size relative to the viewport.',
      'Prefer rem for typography and spacing, % for fluid widths, and px for things that should stay fixed.',
    ],
  },

  typography: {
    title: 'CSS Typography Fundamentals',
    intro: `Typography controls how text looks and reads on a page, and it is one of the highest-leverage areas of CSS — good typography improves readability and perceived quality even when nothing else on the page changes. The core typography properties are font-family, font-size, line-height, and font-weight, and they interact closely with each other.

Beyond individual properties, you also need to decide where your fonts come from: the small set of web-safe fonts that are pre-installed on most devices, or custom fonts loaded with @font-face that give full control over a brand's look but require careful loading strategy.`,
    sections: [
      {
        heading: 'Core Typography Properties',
        body: `Four properties form the backbone of any typographic system.`,
        list: [
          '<strong>font-family</strong> — a prioritized list of typefaces, ending in a generic fallback (serif, sans-serif, monospace), e.g. <code>font-family: "Helvetica Neue", Arial, sans-serif;</code>.',
          '<strong>font-size</strong> — the size of the text, ideally set in rem for accessibility (see the Units topic).',
          '<strong>line-height</strong> — the vertical space a line of text occupies; a unitless value like 1.5 is preferred because it scales proportionally with font-size.',
          '<strong>font-weight</strong> — controls boldness, from 100 (thin) to 900 (black), with 400 being normal and 700 being bold in most typefaces.',
        ],
      },
      {
        heading: 'Web-Safe Fonts vs. @font-face',
        body: `Web-safe fonts (Arial, Georgia, Times New Roman, Verdana, and a handful of others) are pre-installed on nearly every operating system, so they render instantly with no download and are a safe fallback choice. To use a custom typeface that isn't web-safe, @font-face lets you load a font file directly: <code>@font-face { font-family: "Brand Sans"; src: url("brand-sans.woff2") format("woff2"); }</code>. Custom fonts add a network request and can cause a brief flash of unstyled or fallback text, so they should be used deliberately and typically paired with font-display: swap.`,
      },
      {
        heading: 'Readable Line-Height and Measure',
        body: `A line-height between 1.4 and 1.6 is generally considered comfortable for body text, and pairing it with a reasonable line length (measure) — often capped with max-width: 65ch — keeps paragraphs from becoming too wide to track easily with the eye.`,
      },
    ],
    examples: [
      {
        caption: 'A typical body-text style combining font stack, size, line-height, and measure',
        code: `body {
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #222;
}

p {
  max-width: 65ch;
}

h1 {
  font-weight: 700;
  line-height: 1.2;
}`,
        output: 'Body paragraphs render with comfortable line spacing and a readable line length capped at roughly 65 characters, while headings stay tighter and bolder for visual hierarchy.',
      },
      {
        caption: 'Loading a custom font with @font-face and a fallback stack',
        code: `@font-face {
  font-family: "Brand Sans";
  src: url("/fonts/brand-sans.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}

h1 {
  font-family: "Brand Sans", Arial, sans-serif;
}`,
        output: 'Headings display in the custom "Brand Sans" typeface once it loads; until then, font-display: swap shows the Arial fallback immediately instead of invisible text.',
      },
    ],
    commonMistakes: [
      'Forgetting a generic fallback (sans-serif, serif, monospace) at the end of a font-family list, risking an unstyled system default if every listed font fails to load.',
      'Setting line-height in px, which does not scale properly if font-size changes via media queries or user settings — a unitless value is safer.',
      'Loading multiple font weights and styles via @font-face without font-display, causing a noticeable flash of invisible text (FOIT) while the font downloads.',
      'Using overly long line lengths on wide screens without a max-width or ch-based cap, making body text tiring to read.',
    ],
    keyPoints: [
      'font-family, font-size, line-height, and font-weight are the core levers for typographic control.',
      'Web-safe fonts render instantly with no download; @font-face enables custom brand fonts at the cost of a network request.',
      'A unitless line-height (around 1.4–1.6 for body text) scales cleanly with font-size changes.',
      'font-display: swap avoids invisible text while a custom web font is downloading.',
    ],
  },

  positioning: {
    title: 'CSS Positioning',
    intro: `The position property controls how an element is placed in the document and how it responds to the top, right, bottom, and left offset properties. Positioning is one of the more conceptually tricky parts of CSS because each value changes not just where the element itself sits, but how it interacts with the normal flow of surrounding content.

There are five values to know: static, relative, absolute, fixed, and sticky. Each removes the element from — or keeps it in — normal document flow differently, and each establishes offsets relative to a different reference point.`,
    sections: [
      {
        heading: 'static and relative',
        body: `<code>position: static</code> is the default for every element — it sits in normal document flow, and top/right/bottom/left have no effect on it. <code>position: relative</code> also stays in normal flow (it still takes up its original space), but now top/right/bottom/left can nudge it visually away from that original position, without affecting the layout of surrounding elements. Relative positioning is also commonly used just to establish a new containing block for an absolutely positioned child.`,
      },
      {
        heading: 'absolute and fixed',
        body: `<code>position: absolute</code> removes the element from normal flow entirely, so surrounding elements act as if it isn't there, and it is positioned relative to its nearest ancestor that has a position value other than static (its "containing block"). If no such ancestor exists, it positions relative to the initial containing block (roughly the page). <code>position: fixed</code> also removes the element from flow, but always positions it relative to the browser viewport, so it stays in place even when the page scrolls — commonly used for sticky headers or floating action buttons.`,
      },
      {
        heading: 'sticky',
        body: `<code>position: sticky</code> behaves like relative positioning until the element reaches a specified threshold (e.g. <code>top: 0</code>) during scrolling, at which point it "sticks" and behaves like fixed positioning until its containing block scrolls out of view. It is commonly used for section headers that should stay visible while their section is on screen, then scroll away naturally once the next section begins.`,
      },
    ],
    examples: [
      {
        caption: 'Absolute positioning relative to a relatively positioned parent',
        code: `<!--
<div class="card">
  <span class="badge">New</span>
  <p>Card content...</p>
</div>
-->

.card {
  position: relative; /* establishes the containing block */
  padding: 1rem;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}`,
        output: 'The "New" badge is pinned to the top-right corner of the card, positioned relative to the card itself rather than the page, because .card establishes the containing block.',
      },
      {
        caption: 'A sticky section header that stays visible while scrolling through its section',
        code: `.section-header {
  position: sticky;
  top: 0;
  background: white;
  padding: 0.5rem 1rem;
}`,
        output: 'The header scrolls normally with the page until it reaches the top of the viewport, then sticks there while the rest of its section scrolls underneath, releasing once the section ends.',
      },
    ],
    commonMistakes: [
      'Setting position: absolute on a child without giving any ancestor position: relative, causing the child to jump to the page level instead of staying within its intended container.',
      'Using position: fixed for an element the user expects to scroll with a specific section, rather than the whole page.',
      'Forgetting that position: sticky requires a defined offset (like top: 0) to activate, and that it only works within the bounds of its containing block.',
      'Assuming position: relative removes an element from normal flow the way absolute and fixed do — it does not; the original space is preserved.',
    ],
    keyPoints: [
      'static is the default and ignores offset properties; relative stays in flow but can be nudged visually.',
      'absolute removes an element from flow and positions it relative to the nearest positioned ancestor.',
      'fixed removes an element from flow and positions it relative to the viewport, staying in place during scroll.',
      'sticky toggles between relative and fixed-like behavior based on scroll position and a defined threshold.',
    ],
  },

  display: {
    title: 'The CSS display Property',
    intro: `The display property determines the fundamental layout behavior of an element — whether it starts on a new line, whether it accepts a width and height, and how it interacts with the elements around it. It is one of the most frequently used and most consequential properties in CSS, because changing an element's display value can completely change how a layout behaves.

The most common values are block, inline, inline-block, and none, and understanding the practical difference between them clears up a lot of early CSS confusion, such as why a width declaration seems to have no effect on some elements.`,
    sections: [
      {
        heading: 'block',
        body: `Block-level elements (like &lt;div&gt;, &lt;p&gt;, and &lt;h1&gt; by default) always start on a new line and expand to fill the full width of their container unless a width is specified. They accept width, height, margin, and padding on all sides normally. Stacking block elements vertically is the natural, default flow of an HTML document.`,
      },
      {
        heading: 'inline',
        body: `Inline elements (like &lt;span&gt;, &lt;a&gt;, and &lt;strong&gt; by default) flow within the surrounding text and do not start on a new line. Critically, they ignore width and height entirely, and vertical margin/padding is not respected for layout purposes (though it may render visually, it won't push surrounding content). Only horizontal padding and margin reliably affect layout on inline elements.`,
      },
      {
        heading: 'inline-block and none',
        body: `<code>inline-block</code> combines both worlds: the element flows inline with surrounding content like an inline element, but it accepts width, height, and full margin/padding like a block element — commonly used for button-like elements that need to sit next to text but also need a defined size. <code>display: none</code> removes the element entirely from the rendered layout — it takes up no space at all and isn't visible, as opposed to visibility: hidden, which hides an element but preserves its layout space.`,
      },
    ],
    examples: [
      {
        caption: 'block, inline, and inline-block behaving differently in the same context',
        code: `<!--
<span class="block-span">Block</span>
<span class="inline-span">Inline</span>
<span class="inline-block-span">Inline-block</span>
-->

.block-span { display: block; width: 200px; background: #eee; }
.inline-span { display: inline; width: 200px; background: #ddd; } /* width is ignored */
.inline-block-span { display: inline-block; width: 200px; background: #ccc; }`,
        output: 'The block span forces a line break and honors its 200px width; the inline span sits within text flow but ignores the width entirely; the inline-block span flows next to surrounding inline content while still honoring the 200px width.',
      },
      {
        caption: 'Toggling visibility with display: none versus visibility: hidden',
        code: `.hidden-none { display: none; }        /* removed from layout entirely */
.hidden-invisible { visibility: hidden; } /* still occupies its space */`,
        output: 'The element with display: none disappears completely and surrounding elements collapse into its space, while the visibility: hidden element becomes invisible but leaves an empty gap where it used to be.',
      },
    ],
    commonMistakes: [
      'Setting width or height on a naturally inline element (like a <span> or <a>) and being confused when it has no effect, without first changing display to inline-block or block.',
      'Using display: none when the intent was only to visually hide an element while keeping its layout space, when visibility: hidden was the correct choice.',
      'Assuming vertical margin/padding on inline elements behaves the same as on block elements for layout purposes.',
      'Forgetting that display: none also removes an element from screen-reader and keyboard-navigation flow, which has accessibility implications beyond visual layout.',
    ],
    keyPoints: [
      'block elements start on a new line and accept full width/height and margin/padding; inline elements flow with text and ignore width/height.',
      'inline-block merges both: it flows inline but honors width, height, and margin/padding like a block element.',
      'display: none removes an element from the rendered layout entirely, unlike visibility: hidden, which preserves its space.',
      'Choosing the right display value is often the fix for layouts that "don\'t respond" to size or spacing properties.',
    ],
  },

  flexbox: {
    title: 'CSS Flexbox',
    intro: `Flexbox (the Flexible Box Layout module) is a one-dimensional layout system designed to distribute space and align items along a single axis — either a row or a column — inside a container. It replaced older, hackier techniques like floats and inline-block for common layout tasks such as navigation bars, centering content, and evenly spacing items.

Flexbox works through a parent/child relationship: you turn an element into a "flex container" with <code>display: flex</code>, and its direct children automatically become "flex items" that respond to a specific set of alignment and sizing properties.`,
    sections: [
      {
        heading: 'Flex Container Properties',
        body: `These properties are set on the parent element to control the overall layout of its children.`,
        list: [
          '<strong>flex-direction</strong> — sets the main axis: row (default, left-to-right), column, row-reverse, or column-reverse.',
          '<strong>justify-content</strong> — aligns items along the main axis: flex-start, flex-end, center, space-between, space-around, or space-evenly.',
          '<strong>align-items</strong> — aligns items along the cross axis (perpendicular to the main axis): flex-start, flex-end, center, stretch (default), or baseline.',
          '<strong>flex-wrap</strong> — controls whether items wrap onto multiple lines (wrap) or are forced onto one line and potentially overflow (nowrap, the default).',
        ],
      },
      {
        heading: 'Flex Item Properties',
        body: `These properties are set on the children to control how each individual item grows, shrinks, and sizes itself relative to its siblings.`,
        list: [
          '<strong>flex-grow</strong> — a unitless number defining how much of the remaining free space an item should consume relative to its siblings; 0 (default) means it won\'t grow.',
          '<strong>flex-shrink</strong> — defines how much an item should shrink relative to siblings when there isn\'t enough space; 1 is the default, 0 prevents shrinking.',
          '<strong>flex-basis</strong> — sets the item\'s initial size before growing or shrinking is calculated, similar to width but flex-aware.',
          '<strong>flex shorthand</strong> — combines all three: <code>flex: 1 1 0;</code> is a common pattern meaning "grow and shrink equally from a zero base," producing evenly sized items.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A navigation bar centered vertically with space between links',
        code: `<!--
<nav class="navbar">
  <span class="logo">Brand</span>
  <div class="links"><a href="#">Home</a><a href="#">About</a></div>
</nav>
-->

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}`,
        output: 'The logo sits at the far left and the links group sits at the far right, both vertically centered within the navbar regardless of their differing heights.',
      },
      {
        caption: 'Three equally sized columns that grow and shrink together',
        code: `.row {
  display: flex;
  gap: 1rem;
}

.column {
  flex: 1 1 0; /* grow equally, shrink equally, start from zero basis */
}`,
        output: 'The three columns split the available width evenly, and if the container is resized, all three columns shrink or grow together while staying equal in width.',
      },
    ],
    commonMistakes: [
      'Forgetting that justify-content aligns along the main axis while align-items aligns along the cross axis, and mixing them up when flex-direction is column.',
      'Not setting flex-wrap: wrap on a row of items and being surprised when they overflow the container instead of moving to a new line.',
      'Using width on flex items when flex-basis (or the flex shorthand) would interact more predictably with grow/shrink behavior.',
      'Applying flex properties to a container without first setting display: flex on it, so the properties have no effect at all.',
    ],
    keyPoints: [
      'display: flex on a parent turns its direct children into flex items along a single main axis.',
      'justify-content controls main-axis alignment; align-items controls cross-axis alignment.',
      'flex-grow, flex-shrink, and flex-basis (often combined via the flex shorthand) control how individual items size themselves.',
      'Flexbox is one-dimensional — for full two-dimensional layouts (rows and columns together), CSS Grid is usually the better tool.',
    ],
  },

  grid: {
    title: 'CSS Grid Layout',
    intro: `CSS Grid is a two-dimensional layout system that lets you control rows and columns simultaneously, which makes it the natural choice for page-level layouts, card grids, and any design where content needs to align both horizontally and vertically at once. Where Flexbox excels at distributing items along a single axis, Grid excels at defining an explicit structure that content is placed into.

Like Flexbox, Grid works through a container/item relationship: <code>display: grid</code> on a parent turns it into a grid container, and you define the shape of that grid with grid-template-columns and grid-template-rows, then place children into specific cells or spans.`,
    sections: [
      {
        heading: 'Defining the Grid',
        body: `<code>grid-template-columns</code> and <code>grid-template-rows</code> define the size of each column and row as a space-separated list of values, e.g. <code>grid-template-columns: 200px 1fr 1fr;</code> creates a fixed 200px first column followed by two equally sized flexible columns. The <code>fr</code> unit represents a fraction of the remaining available space, making it ideal for flexible grid tracks. <code>gap</code> (shorthand for row-gap and column-gap) adds consistent spacing between grid tracks without needing margins on individual items.`,
      },
      {
        heading: 'Placing Items with grid-area',
        body: `Items can be positioned explicitly using grid-column and grid-row (e.g. <code>grid-column: 1 / 3;</code> spans from line 1 to line 3), or more readably by naming areas with <code>grid-template-areas</code> on the container and assigning each child a matching <code>grid-area</code> name. Named areas make complex layouts, like a classic header/sidebar/content/footer page, much easier to read at a glance than raw line numbers.`,
      },
      {
        heading: 'Grid vs. Flexbox',
        body: `A practical rule: reach for Grid when you need to control both rows and columns together as a cohesive layout (e.g. a full page or a photo gallery), and reach for Flexbox when you're arranging items along one direction (e.g. a toolbar or a list of tags). The two are not mutually exclusive — a Grid layout commonly contains Flexbox-arranged content inside individual grid cells.`,
      },
    ],
    examples: [
      {
        caption: 'A responsive card grid using fr units and auto-fit',
        code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}`,
        output: 'Cards arrange themselves into as many 200px-minimum columns as fit the container width, each column stretching equally to fill any remaining space, and automatically reflowing as the viewport is resized.',
      },
      {
        caption: 'A classic page layout using named grid-template-areas',
        code: `.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  gap: 1rem;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }`,
        output: 'The header and footer stretch across both columns, the sidebar occupies a fixed 200px column on the left, and the main content fills the remaining space between them, all within a full-height page layout.',
      },
    ],
    commonMistakes: [
      'Using Flexbox and fighting it to build a two-dimensional layout that Grid would handle far more directly.',
      'Forgetting that grid line numbers start at 1, not 0, when using grid-column or grid-row with explicit line numbers.',
      'Misaligning the quoted strings in grid-template-areas (uneven column counts per row), which causes the layout to silently fail.',
      'Using fixed pixel widths for every column instead of the fr unit, producing a grid that doesn\'t adapt to different screen sizes.',
    ],
    keyPoints: [
      'display: grid plus grid-template-columns/rows defines a two-dimensional track structure for a container.',
      'The fr unit distributes remaining space proportionally between flexible tracks.',
      'grid-template-areas paired with grid-area on children creates highly readable, named layout regions.',
      'Grid suits full two-axis layouts; Flexbox suits one-axis arrangements — the two are often combined.',
    ],
  },

  'responsive-design': {
    title: 'Responsive Web Design Principles',
    intro: `Responsive design is the practice of building layouts that adapt gracefully to any screen size, from a small phone to a large desktop monitor, using a single codebase rather than separate sites for each device type. It rests on a handful of core techniques: fluid layouts, flexible media, and media queries (covered in depth in the next topic).

The dominant philosophy for building responsive sites today is "mobile-first": you design and write CSS for the smallest screen first, then progressively add complexity and additional layout for larger screens, rather than designing for desktop and trying to cram it down to mobile afterward.`,
    sections: [
      {
        heading: 'Mobile-First Design Philosophy',
        body: `In a mobile-first approach, your base (unqualified) CSS rules describe the simplest, single-column, small-screen experience, and you use <code>min-width</code> media queries to layer on enhancements as the viewport grows — for example, switching from a single column to a multi-column grid once there's enough horizontal space. This approach tends to produce leaner CSS overall, because you're adding complexity only where it's needed, and it naturally prioritizes performance and content on the most constrained devices.`,
      },
      {
        heading: 'Fluid Layouts',
        body: `A fluid layout uses relative units (percentages, fr, rem) instead of fixed pixel widths, so containers and content naturally resize with the viewport instead of requiring a breakpoint for every possible screen width. Combining fluid widths with <code>max-width</code> prevents content from becoming uncomfortably wide on very large screens while still shrinking gracefully on small ones — a pattern often seen as <code>width: 100%; max-width: 1200px;</code>.`,
      },
      {
        heading: 'Flexible Media',
        body: `Images and other embedded media should scale within their container rather than overflowing it or leaving awkward gaps. The near-universal baseline rule is <code>img, video { max-width: 100%; height: auto; }</code>, which lets media shrink to fit its container on small screens while never exceeding its natural size on larger ones.`,
      },
    ],
    examples: [
      {
        caption: 'A mobile-first layout that adds columns only once there is enough space',
        code: `.gallery {
  display: grid;
  grid-template-columns: 1fr; /* single column by default, mobile-first base */
  gap: 1rem;
}

@media (min-width: 768px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr); /* two columns on tablets and up */
  }
}

@media (min-width: 1200px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr); /* three columns on large desktops */
  }
}`,
        output: 'On a phone, gallery items stack in a single column; on a tablet-sized viewport they arrange into two columns; on a large desktop they expand into three, all from one shared stylesheet.',
      },
      {
        caption: 'Fluid width with a max-width cap and responsive images',
        code: `.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}`,
        output: 'The container fills available width on small screens and centers itself with a comfortable maximum width on large monitors, while every image scales down to fit its column without ever stretching beyond its original resolution.',
      },
    ],
    commonMistakes: [
      'Designing for desktop first and retrofitting mobile styles with max-width overrides, which usually results in bloated, override-heavy CSS.',
      'Using fixed pixel widths for major layout containers, forcing horizontal scrolling on smaller screens.',
      'Forgetting max-width: 100% on images, letting a large image overflow its container on narrow viewports.',
      'Adding too many arbitrary breakpoints tuned to specific devices instead of choosing breakpoints based on where the content itself starts to look cramped or sparse.',
    ],
    keyPoints: [
      'Mobile-first design starts with base styles for small screens and layers on enhancements with min-width media queries.',
      'Fluid layouts use relative units so content resizes naturally instead of relying solely on breakpoints.',
      'max-width: 100%; height: auto; is the standard baseline rule for responsive images and media.',
      'Choose breakpoints based on where your content needs them, not arbitrary device widths.',
    ],
  },

  'media-queries': {
    title: 'CSS Media Queries',
    intro: `Media queries are the mechanism that makes responsive design possible in CSS: they let you apply a block of styles conditionally, based on characteristics of the device or viewport, most commonly its width. A media query wraps a set of normal CSS rules inside an <code>@media</code> block, and the browser only applies those rules when the specified condition is true.

Media queries can test many features (orientation, resolution, hover capability, and more), but by far the most common use is testing viewport width with min-width and max-width, which is how "breakpoints" are implemented in practice.`,
    sections: [
      {
        heading: 'Basic Syntax',
        body: `A media query looks like <code>@media (condition) { /* rules */ }</code>. The condition is a media feature test, such as <code>(min-width: 768px)</code>, and any normal CSS rules inside the block only apply when that condition matches the current viewport. Multiple conditions can be combined with <code>and</code>, and multiple queries can be separated with commas to act as an "or."`,
      },
      {
        heading: 'min-width vs. max-width',
        body: `<code>min-width</code> matches when the viewport is at least that wide — this is the basis of mobile-first design, since you write base styles for the smallest screens and add min-width queries to enhance the layout as space increases. <code>max-width</code> matches when the viewport is at most that wide, which is the basis of desktop-first design, where you write base styles for large screens and use max-width queries to simplify the layout as space shrinks. Mixing both philosophies in the same project without a clear convention is a common source of confusing, hard-to-predict CSS.`,
      },
      {
        heading: 'Other Useful Media Features',
        body: `Beyond width, media queries can test <code>orientation: portrait / landscape</code>, <code>prefers-color-scheme: dark / light</code> for respecting OS-level dark mode, and <code>prefers-reduced-motion: reduce</code> for respecting a user's request to minimize animation (covered further in the accessibility topic).`,
      },
    ],
    examples: [
      {
        caption: 'A mobile-first breakpoint switching a nav from a stacked to a horizontal layout',
        code: `.nav-links {
  display: flex;
  flex-direction: column; /* stacked on small screens */
}

@media (min-width: 768px) {
  .nav-links {
    flex-direction: row; /* side by side once there is enough width */
    gap: 1.5rem;
  }
}`,
        output: 'Navigation links stack vertically on narrow screens and switch to a horizontal row with spacing once the viewport reaches 768px or wider.',
      },
      {
        caption: 'Combining a width condition with a feature query using "and"',
        code: `@media (min-width: 600px) and (orientation: landscape) {
  .hero {
    padding: 4rem 2rem;
  }
}`,
        output: 'The hero section receives extra padding only when the viewport is at least 600px wide AND in landscape orientation — both conditions must be true simultaneously.',
      },
    ],
    commonMistakes: [
      'Mixing min-width (mobile-first) and max-width (desktop-first) queries inconsistently within the same stylesheet, making the cascade hard to predict.',
      'Choosing breakpoints that match specific, popular device widths instead of the widths where the content itself starts to break down.',
      'Forgetting the viewport meta tag (<meta name="viewport" content="width=device-width, initial-scale=1">) in HTML, which causes mobile browsers to render at a zoomed-out desktop width and ignore media queries as expected.',
      'Writing overlapping min-width and max-width queries that unintentionally both match at certain widths, causing conflicting styles.',
    ],
    keyPoints: [
      '@media (condition) { } applies a block of CSS only when the condition matches the current viewport or device.',
      'min-width matches at or above a width (mobile-first); max-width matches at or below a width (desktop-first).',
      'Conditions can be combined with "and" for AND logic, or comma-separated for OR logic.',
      'Media queries can also test orientation, prefers-color-scheme, and prefers-reduced-motion, not just width.',
    ],
  },

  variables: {
    title: 'CSS Custom Properties (Variables)',
    intro: `CSS custom properties, commonly called CSS variables, let you define a reusable value once and reference it throughout a stylesheet, and even update it dynamically at runtime with JavaScript or media queries. Before custom properties existed, CSS had no native concept of a variable, forcing teams to rely on preprocessors like Sass purely for that feature.

A custom property is declared with a name prefixed by two dashes (e.g. <code>--primary-color</code>) and is read anywhere with the <code>var()</code> function. Because custom properties participate in the cascade and inheritance like any other CSS property, they can be scoped globally on :root or overridden locally within any selector.`,
    sections: [
      {
        heading: 'Declaring and Using Custom Properties',
        body: `Custom properties are typically declared on <code>:root</code> (a pseudo-class matching the &lt;html&gt; element) so they're available globally: <code>:root { --primary-color: #0057d9; }</code>. They're consumed anywhere with <code>var(--primary-color)</code>, and <code>var()</code> accepts an optional second argument as a fallback value if the variable is undefined: <code>var(--gap, 1rem)</code>.`,
      },
      {
        heading: 'Scoping and Overriding',
        body: `Because custom properties inherit and follow the cascade, redeclaring a variable inside a more specific selector overrides it only within that selector's scope, without affecting the global value. This makes them ideal for theming — a <code>.dark-theme</code> class can redefine <code>--background-color</code> and <code>--text-color</code>, and every component using <code>var()</code> for those values updates automatically wherever that class is applied.`,
      },
      {
        heading: 'Custom Properties vs. Preprocessor Variables',
        body: `Sass or Less variables are resolved once at compile time and produce static CSS — they cannot change based on runtime conditions. CSS custom properties are live: they can be read and changed by JavaScript (<code>element.style.setProperty('--x', 'value')</code>), and they respond to media queries and pseudo-class state changes, making them strictly more powerful for dynamic theming, even though they don't include preprocessor features like mixins or nesting.`,
      },
    ],
    examples: [
      {
        caption: 'Global theme variables consumed across multiple components',
        code: `:root {
  --primary-color: #0057d9;
  --spacing-unit: 1rem;
  --border-radius: 8px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
}

.card {
  border: 1px solid var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
}`,
        output: 'Both the button and the card pull their color, spacing, and radius from the same shared variables, so changing --primary-color in one place updates every consumer at once.',
      },
      {
        caption: 'A dark theme override using a scoped custom property',
        code: `:root {
  --bg-color: #ffffff;
  --text-color: #111111;
}

.dark-theme {
  --bg-color: #111111;
  --text-color: #f5f5f5;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}`,
        output: 'Applying the .dark-theme class to a container (or the body) flips the background and text colors for everything inside it, since the redefined variables cascade down without touching the :root defaults elsewhere.',
      },
    ],
    commonMistakes: [
      'Forgetting the double-dash prefix on the variable name (writing primary-color instead of --primary-color), which silently fails since it is not recognized as a custom property.',
      'Expecting a custom property defined inside a class to be available globally, without realizing its scope is limited to that selector and its descendants.',
      'Not providing a fallback value in var(--name, fallback) for optional variables, risking an unstyled result if the variable is ever undefined.',
      'Confusing CSS custom properties with Sass/Less variables and assuming both resolve at the same time — custom properties are live and can change at runtime.',
    ],
    keyPoints: [
      'Custom properties are declared as --name: value and read with var(--name), often defined globally on :root.',
      'var() supports a fallback second argument: var(--name, fallback-value).',
      'Custom properties inherit and follow the cascade, so they can be overridden locally for scoped theming.',
      'Unlike preprocessor variables, CSS custom properties are live and can be changed at runtime via JavaScript or media queries.',
    ],
  },

  transitions: {
    title: 'CSS Transitions',
    intro: `Transitions let a property change smoothly over time instead of jumping instantly from one value to another, which is what makes hover effects, expanding menus, and other interactive feedback feel polished rather than abrupt. A transition is defined with a small set of properties that describe what to animate, how long it takes, and the pacing of the change.

Transitions are triggered by an actual change in a property's value — commonly caused by a pseudo-class like :hover or :focus, or by a class being toggled with JavaScript — and they only animate between a starting and ending value, unlike full keyframe animations which can define multiple intermediate steps.`,
    sections: [
      {
        heading: 'The Transition Properties',
        body: `Four properties (usually combined into the transition shorthand) control the effect.`,
        list: [
          '<strong>transition-property</strong> — which CSS property to animate, e.g. background-color, transform, or all for every animatable property.',
          '<strong>transition-duration</strong> — how long the change takes, e.g. 0.3s or 300ms.',
          '<strong>transition-timing-function</strong> — the pacing curve of the change: ease (default, starts fast then slows), linear (constant speed), ease-in, ease-out, or a custom cubic-bezier().',
          '<strong>transition-delay</strong> — an optional pause before the transition begins.',
        ],
      },
      {
        heading: 'The Shorthand and Multiple Transitions',
        body: `The shorthand combines all four in one line: <code>transition: background-color 0.3s ease-in-out;</code>. Multiple properties can transition with different timings by comma-separating shorthand values: <code>transition: transform 0.2s ease, opacity 0.4s linear;</code> animates transform and opacity independently, each with its own duration and easing.`,
      },
      {
        heading: 'What Can Be Transitioned',
        body: `Only properties with an intermediate, interpolatable value can transition smoothly — numeric values, colors, and transforms all work well. Properties like display cannot be smoothly transitioned because there's no "halfway" state between block and none. For performance, transform and opacity are the cheapest properties to animate, because they don't trigger the browser to recalculate layout the way width or top do.`,
      },
    ],
    examples: [
      {
        caption: 'A button with a smooth color and scale transition on hover',
        code: `.button {
  background-color: #0057d9;
  transform: scale(1);
  transition: background-color 0.3s ease, transform 0.2s ease-out;
}

.button:hover {
  background-color: #003f9e;
  transform: scale(1.05);
}`,
        output: 'On hover, the button smoothly darkens in color over 0.3 seconds and gently scales up to 105% of its size over 0.2 seconds, rather than snapping instantly to the new values.',
      },
      {
        caption: 'A delayed transition on a dropdown menu appearing',
        code: `.dropdown {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.dropdown.open {
  opacity: 1;
  visibility: visible;
}`,
        output: 'When the .open class is added, the dropdown fades in smoothly over a quarter second instead of appearing instantly, and it fades back out the same way when the class is removed.',
      },
    ],
    commonMistakes: [
      'Trying to transition display: none to display: block directly, which has no visible effect since display has no intermediate state — opacity/visibility combinations are used instead.',
      'Using transition: all as a lasting solution instead of just for prototyping, which can unintentionally animate properties you didn\'t mean to (and hurts performance).',
      'Forgetting that the transition must be declared on the base state (or a shared parent selector), not only inside the :hover rule, or the transition back to the original state won\'t animate.',
      'Animating layout-triggering properties like width, height, or top for frequent interactions instead of the cheaper transform and opacity, causing janky performance.',
    ],
    keyPoints: [
      'transition-property, transition-duration, transition-timing-function, and transition-delay control how a property change animates.',
      'The transition shorthand combines all four, and comma-separating shorthands animates multiple properties independently.',
      'Only properties with interpolatable values can transition smoothly; transform and opacity are the most performance-friendly choices.',
      'The transition declaration should live on the base selector so it applies both when the state is entered and when it is removed.',
    ],
  },

  transforms: {
    title: 'CSS Transforms',
    intro: `The transform property lets you visually move, rotate, scale, or skew an element without affecting the document's normal layout flow — surrounding elements behave as if the transformed element were still in its original position and size. This makes transforms extremely efficient for animation and interactive effects, since they are handled by the browser's compositor rather than triggering expensive layout recalculations.

Transforms are commonly paired with transitions or animations (covered next) to create movement, but a transform can also be applied as a static style on its own, such as rotating an icon or offsetting an element by a precise amount.`,
    sections: [
      {
        heading: 'The Four Core Transform Functions',
        body: `Each function manipulates a different visual aspect of the element, and multiple functions can be combined in one declaration.`,
        list: [
          '<strong>translate(x, y)</strong> — moves an element along the X and/or Y axis, e.g. translate(20px, -10px); translateX() and translateY() target a single axis.',
          '<strong>rotate(angle)</strong> — rotates an element around its center by a given angle, e.g. rotate(45deg).',
          '<strong>scale(x, y)</strong> — resizes an element proportionally, e.g. scale(1.2) enlarges it by 20%; scale(1, 0.5) stretches only the vertical axis to half size.',
          '<strong>skew(x-angle, y-angle)</strong> — slants an element along the X and/or Y axis, e.g. skewX(10deg) creates a slanted, italic-like effect.',
        ],
      },
      {
        heading: 'Combining Transforms and transform-origin',
        body: `Multiple transform functions can be listed space-separated in a single declaration, and they apply in the order written: <code>transform: translateX(20px) rotate(15deg);</code> first shifts the element, then rotates it. The <code>transform-origin</code> property controls the pivot point for rotation and scaling, defaulting to the element's center (50% 50%); setting it to a corner, like <code>transform-origin: top left;</code>, changes how the element rotates or scales around that point instead.`,
      },
      {
        heading: 'Why Transforms Are Performance-Friendly',
        body: `Because translate, rotate, and scale don't change an element's actual position or size in the document flow, the browser can animate them purely on the GPU compositor layer without recalculating layout or repainting neighboring elements — this is why transform (along with opacity) is recommended over animating properties like top, left, width, or margin for smooth, efficient animations.`,
      },
    ],
    examples: [
      {
        caption: 'Combining translate and rotate for a card hover lift effect',
        code: `.card {
  transition: transform 0.25s ease;
}

.card:hover {
  transform: translateY(-8px) rotate(-1deg);
}`,
        output: 'On hover, the card lifts 8 pixels upward and tilts very slightly counter-clockwise, giving a subtle, tactile "lift off the page" effect without disturbing the layout of surrounding cards.',
      },
      {
        caption: 'Scaling from a corner instead of the default center using transform-origin',
        code: `.icon {
  transform-origin: top left;
  transition: transform 0.2s ease;
}

.icon:hover {
  transform: scale(1.5);
}`,
        output: 'The icon grows to 150% of its size while its top-left corner stays fixed in place, rather than expanding outward evenly from its center as it would with the default transform-origin.',
      },
    ],
    commonMistakes: [
      'Using top/left/margin to move an element for a hover animation instead of translate(), which is far more expensive because it forces a layout recalculation.',
      'Forgetting that transform functions apply in the order they are written, which can produce a different visual result than expected when combining translate and rotate.',
      'Assuming transform: scale() changes the element\'s actual box size for layout purposes — it only changes its rendered appearance, not the space it reserves in the flow.',
      'Not setting transform-origin when a rotation or scale needs to pivot from a specific edge or corner rather than the default center.',
    ],
    keyPoints: [
      'translate(), rotate(), scale(), and skew() are the four core transform functions, and they can be combined in one declaration.',
      'Transforms do not affect document flow — surrounding elements are unaffected by a transformed element\'s new visual position or size.',
      'transform-origin sets the pivot point for rotation and scaling, defaulting to the element\'s center.',
      'Transforms are GPU-accelerated and one of the most performance-friendly properties to animate, alongside opacity.',
    ],
  },

  animations: {
    title: 'CSS Animations and @keyframes',
    intro: `While transitions animate between exactly two states (a start and an end), CSS animations let you define multiple intermediate steps using the @keyframes rule, enabling far more complex, self-running motion — like a pulsing badge, a loading spinner, or a multi-stage entrance effect — without needing JavaScript or a triggering event like hover.

An animation has two parts: a @keyframes block that defines what changes at each stage of the animation as a percentage of its total duration, and a set of animation-* properties (or the animation shorthand) applied to the element that specify which keyframes to use and how to play them.`,
    sections: [
      {
        heading: 'Defining @keyframes',
        body: `A @keyframes rule is named and contains percentage-based stops describing the styles at each point in the animation's timeline: <code>0%</code> is the start and <code>100%</code> is the end, with any number of steps in between. You can also use the keywords <code>from</code> (equivalent to 0%) and <code>to</code> (equivalent to 100%) for simple two-stage animations.`,
      },
      {
        heading: 'The Animation Shorthand Properties',
        body: `Once a @keyframes block exists, it's applied to an element via several properties, usually combined in the animation shorthand.`,
        list: [
          '<strong>animation-name</strong> — the name of the @keyframes rule to use.',
          '<strong>animation-duration</strong> — how long one full cycle takes, e.g. 2s.',
          '<strong>animation-timing-function</strong> — the easing curve, same options as transitions (ease, linear, ease-in-out, etc.).',
          '<strong>animation-iteration-count</strong> — how many times it repeats: a number, or infinite for a continuous loop.',
          '<strong>animation-fill-mode</strong> — controls what styles apply before/after the animation plays, e.g. forwards keeps the final keyframe\'s styles after it ends.',
        ],
      },
      {
        heading: 'Combining It All',
        body: `The shorthand packs these together in order: <code>animation: pulse 2s ease-in-out infinite;</code> defines the name, duration, timing function, and iteration count in a single declaration. Additional values like a delay or fill-mode can be appended to the same shorthand.`,
      },
    ],
    examples: [
      {
        caption: 'A looping pulse animation for a notification badge',
        code: `@keyframes pulse {
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.15); opacity: 0.8; }
  100% { transform: scale(1);   opacity: 1; }
}

.badge {
  animation: pulse 1.5s ease-in-out infinite;
}`,
        output: 'The badge continuously grows slightly and fades a little at the halfway point of each 1.5-second cycle, then returns to its original size and opacity, repeating indefinitely.',
      },
      {
        caption: 'A one-time entrance animation that keeps its final state',
        code: `@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-heading {
  animation: fade-in-up 0.6s ease-out forwards;
}`,
        output: 'The heading starts invisible and shifted 20px downward, then animates into full opacity and its natural position over 0.6 seconds, remaining in that final visible state afterward because of animation-fill-mode: forwards.',
      },
    ],
    commonMistakes: [
      'Forgetting animation-fill-mode: forwards on a one-time animation, causing the element to snap back to its pre-animation styles the instant the animation ends.',
      'Using animation-iteration-count: infinite for effects that were only meant to play once, creating a distracting, never-ending motion.',
      'Defining conflicting styles between the base selector and the 0% keyframe, leading to a visible flash before the animation begins.',
      'Overusing multiple simultaneous infinite animations on a page, which can hurt performance and accessibility for users sensitive to motion.',
    ],
    keyPoints: [
      '@keyframes defines percentage-based stops describing an element\'s styles at each point in an animation timeline.',
      'animation-name, animation-duration, animation-timing-function, and animation-iteration-count (often combined via the animation shorthand) control playback.',
      'animation-fill-mode: forwards preserves the final keyframe\'s styles after a one-time animation completes.',
      'Unlike transitions, animations can define many intermediate steps and can run automatically without a triggering event.',
    ],
  },

  'pseudo-classes-elements': {
    title: 'CSS Pseudo-classes and Pseudo-elements',
    intro: `Pseudo-classes and pseudo-elements both let you style things that plain selectors can't reach directly — a particular state of an element, or a specific part of it that doesn't correspond to an actual HTML tag. They look similar in syntax but serve distinct purposes, and mixing them up is one of the most common small mistakes in CSS.

Pseudo-classes (single colon, e.g. <code>:hover</code>) target an element in a particular state or position, while pseudo-elements (double colon, e.g. <code>::before</code>) target a specific sub-part of an element that isn't represented by its own tag in the HTML.`,
    sections: [
      {
        heading: 'Common Pseudo-classes',
        body: `Pseudo-classes describe a condition or state that an element is currently in.`,
        list: [
          '<strong>:hover</strong> — applies while the user\'s pointer is over the element.',
          '<strong>:focus</strong> — applies while the element has keyboard or click focus, essential for accessible forms and interactive elements.',
          '<strong>:nth-child(n)</strong> — matches an element based on its numeric position among its siblings, accepting a number, a keyword (odd, even), or a formula (2n+1); useful for zebra-striping table rows or grid items.',
          '<strong>:first-child / :last-child</strong> — match an element only if it is, respectively, the first or last child of its parent.',
        ],
      },
      {
        heading: 'Common Pseudo-elements',
        body: `Pseudo-elements target a portion of an element rather than the whole thing.`,
        list: [
          '<strong>::before / ::after</strong> — insert generated content immediately before or after an element\'s actual content, most often used with the content property for decorative icons, quotes, or visual flourishes without extra HTML markup.',
          '<strong>::first-line / ::first-letter</strong> — target just the first line or first letter of a text block, commonly used for drop caps or stylized intros.',
          '<strong>::placeholder</strong> — styles the placeholder text of a form input.',
        ],
      },
      {
        heading: 'The Single-Colon vs. Double-Colon Convention',
        body: `Modern CSS uses a single colon for pseudo-classes (:hover, :focus, :nth-child) and a double colon for pseudo-elements (::before, ::after, ::first-line) to make the distinction explicit. For backward compatibility, browsers still accept a single colon for the older pseudo-elements (:before, :after) from CSS2, but the double-colon syntax is the current standard and should be preferred in new code.`,
      },
    ],
    examples: [
      {
        caption: 'Combining a pseudo-class with a pseudo-element for a decorative hover effect',
        code: `.link {
  position: relative;
  text-decoration: none;
}

.link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.25s ease;
}

.link:hover::after {
  width: 100%;
}`,
        output: 'An underline (generated purely with CSS, no extra markup) grows smoothly from 0 to full width beneath the link text whenever the user hovers over it.',
      },
      {
        caption: 'Zebra-striping table rows with :nth-child',
        code: `tr:nth-child(even) {
  background-color: #f7f7f7;
}

tr:nth-child(odd) {
  background-color: #ffffff;
}`,
        output: 'Table rows alternate between light gray and white backgrounds automatically based on their position, with no need to manually add a class to every other row.',
      },
    ],
    commonMistakes: [
      'Using a single colon for pseudo-elements (:before instead of ::before) in new code, which works due to legacy support but goes against the modern convention.',
      'Forgetting that ::before and ::after require a content property (even an empty string, content: "";) to render at all.',
      'Styling :hover on touch devices and assuming it behaves identically to a real mouse hover, when touch interactions handle hover states differently or not at all.',
      'Using :nth-child when the intent was actually to count only elements of a specific type (in which case :nth-of-type is usually the correct choice among mixed siblings).',
    ],
    keyPoints: [
      'Pseudo-classes (single colon) target a state or position of a real element, like :hover, :focus, and :nth-child.',
      'Pseudo-elements (double colon) target a sub-part of an element, like ::before, ::after, and ::first-letter.',
      '::before and ::after require the content property to display and are commonly used for decorative, markup-free visuals.',
      'Prefer the double-colon syntax for pseudo-elements in modern CSS, even though single-colon still works for legacy ones.',
    ],
  },

  architecture: {
    title: 'CSS Architecture and Maintainable Stylesheets',
    intro: `As a project grows, the biggest risk to a stylesheet isn't any single property or selector — it's the accumulation of specificity conflicts, duplicated rules, and unpredictable overrides that make future changes feel dangerous. CSS architecture is the set of conventions and naming strategies that keep a large stylesheet organized, predictable, and safe to change months or years after it was written.

Two ideas do most of the work: a consistent naming convention like BEM that keeps selectors flat and predictable, and a discipline of keeping styles scoped to components rather than relying on deep, highly specific selectors that reach across the whole page.`,
    sections: [
      {
        heading: 'BEM Naming Convention',
        body: `BEM stands for Block, Element, Modifier, and it's a naming pattern that encodes a component's structure directly into its class names, avoiding the need for nested selectors entirely.`,
        list: [
          '<strong>Block</strong> — a standalone component, e.g. <code>.card</code>.',
          '<strong>Element</strong> — a part of that block, written with two underscores, e.g. <code>.card__title</code>, <code>.card__image</code>.',
          '<strong>Modifier</strong> — a variation or state of a block or element, written with two hyphens, e.g. <code>.card--featured</code>, <code>.card__title--large</code>.',
        ],
      },
      {
        heading: 'Component-Scoped CSS',
        body: `Rather than writing selectors that depend on where an element sits in the DOM (like <code>.sidebar .list li a</code>), component-scoped styling gives each meaningful piece its own class and styles it directly (<code>.sidebar-link</code>). This keeps specificity low and flat across the whole codebase, and it means a component's styles keep working correctly even if it gets moved to a different part of the page, because nothing depends on its ancestry.`,
      },
      {
        heading: 'Avoiding Overly Specific Selectors',
        body: `Long, deeply nested selectors (like <code>#page .content .article ul li a.link</code>) are fragile: they're hard to override without adding even more specificity, hard to read, and tightly coupled to one exact HTML structure. A good rule of thumb is to keep selectors to a single class wherever possible, and to treat the need for a very specific selector as a signal that the underlying markup or naming convention needs to be reworked, rather than reached around with a bigger hammer.`,
      },
    ],
    examples: [
      {
        caption: 'A BEM-named card component with an element and a modifier',
        code: `<!--
<div class="card card--featured">
  <img class="card__image" src="...">
  <h3 class="card__title">Featured Post</h3>
</div>
-->

.card { border-radius: 8px; padding: 1rem; }
.card__image { width: 100%; border-radius: 4px; }
.card__title { font-size: 1.25rem; }
.card--featured { border: 2px solid gold; }`,
        output: 'Every class is flat (a single class selector), so specificity stays uniform across the whole component and the "featured" modifier can be added or removed independently without disturbing the base card styles.',
      },
      {
        caption: 'Replacing a fragile, deeply nested selector with a flat, scoped class',
        code: `/* Before: fragile, high specificity, depends on exact HTML nesting */
#sidebar .widget-list li a.active { color: blue; }

/* After: flat, low specificity, portable to any markup structure */
.sidebar-link--active { color: blue; }`,
        output: 'The refactored rule applies the same color with much lower, more predictable specificity, and it keeps working correctly even if the link is moved out of the original nested list structure.',
      },
    ],
    commonMistakes: [
      'Writing selectors that mirror the current HTML nesting exactly, which breaks the moment the markup structure changes even slightly.',
      'Mixing BEM with deeply nested descendant selectors in the same codebase, defeating the purpose of BEM\'s flat specificity.',
      'Reaching for an ID selector or !important to override an overly specific rule instead of simplifying the original selector.',
      'Naming classes after visual appearance (like .red-text) instead of purpose (like .error-message), which breaks down as soon as the design changes.',
    ],
    keyPoints: [
      'BEM (Block__Element--Modifier) encodes component structure into class names, avoiding the need for nested selectors.',
      'Component-scoped styling with flat, single-class selectors keeps specificity low and predictable across a project.',
      'Deeply nested, highly specific selectors are fragile and hard to override safely — treat the need for one as a design smell.',
      'Consistent naming conventions make a stylesheet safe to change months later, by someone who didn\'t write the original code.',
    ],
  },

  accessibility: {
    title: 'CSS and Accessibility',
    intro: `Accessibility in CSS is about making sure the visual styling of a page doesn't create barriers for people with different vision, motor, or cognitive needs. Because CSS controls color, contrast, focus indication, and motion, it plays a direct role in whether a site is usable by people relying on screen readers, keyboard navigation, or assistive settings at the operating-system level.

Three concerns come up constantly in accessible CSS: sufficient color contrast for readability, visible focus indicators for keyboard users, and respecting a user's request to reduce motion — each backed by concrete, testable CSS techniques rather than vague guidelines.`,
    sections: [
      {
        heading: 'Color Contrast',
        body: `Text needs sufficient contrast against its background to be readable by users with low vision or color blindness. The Web Content Accessibility Guidelines (WCAG) define a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (roughly 18pt or larger, or 14pt bold) at the AA compliance level. Contrast is a function purely of the color and background-color values you choose in CSS, so checking a color pairing with a contrast-ratio tool before shipping is a simple, high-impact habit.`,
      },
      {
        heading: 'Focus-Visible Styles',
        body: `Keyboard users navigate a page by tabbing between focusable elements (links, buttons, form fields), and they rely entirely on a visible focus indicator — usually an outline — to know where they currently are on the page. Removing the default outline with <code>outline: none</code> without providing a clear replacement is one of the most damaging accessibility mistakes in CSS. The modern <code>:focus-visible</code> pseudo-class lets you style focus specifically for keyboard interaction while avoiding an outline appearing on a simple mouse click, giving the best experience for both input methods.`,
      },
      {
        heading: 'prefers-reduced-motion',
        body: `Some users experience discomfort, dizziness, or distraction from animated motion, and many operating systems expose a "reduce motion" accessibility setting that CSS can detect with the <code>prefers-reduced-motion</code> media feature. Wrapping non-essential animations and transitions in <code>@media (prefers-reduced-motion: reduce) { ... }</code> lets you shorten or remove motion for users who have requested it, without affecting the experience for everyone else.`,
      },
    ],
    examples: [
      {
        caption: 'A visible focus style that only appears for keyboard navigation',
        code: `.button {
  outline: none; /* removing default requires a deliberate replacement below */
}

.button:focus-visible {
  outline: 3px solid #0057d9;
  outline-offset: 2px;
}`,
        output: 'Clicking the button with a mouse shows no outline, but tabbing to it with a keyboard displays a clear, high-contrast 3px outline offset from the edge, so keyboard users always know where focus currently is.',
      },
      {
        caption: 'Disabling non-essential animation for users who prefer reduced motion',
        code: `.hero-heading {
  animation: fade-in-up 0.6s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .hero-heading {
    animation: none;
    opacity: 1;
    transform: none;
  }
}`,
        output: 'Most users see the heading animate in with a fade and slide, while users with reduced-motion enabled at the OS level see the heading appear immediately in its final position, with no animation at all.',
      },
    ],
    commonMistakes: [
      'Removing outline: none on focusable elements without providing any visible replacement, leaving keyboard users with no way to see where focus is.',
      'Choosing text and background colors based on aesthetics alone without checking the resulting contrast ratio against WCAG minimums.',
      'Building elaborate scroll-triggered or looping animations with no prefers-reduced-motion fallback, causing discomfort for motion-sensitive users.',
      'Conveying important information through color alone (e.g. red text for errors) without an additional visual cue like an icon or label, which fails for color-blind users.',
    ],
    keyPoints: [
      'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.',
      ':focus-visible lets you style keyboard focus clearly without showing the same outline on every mouse click.',
      '@media (prefers-reduced-motion: reduce) lets a stylesheet respect a user\'s OS-level request to minimize animation.',
      'Accessible CSS is testable, not just aesthetic — contrast ratios and focus visibility can be verified concretely before shipping.',
    ],
  },
}
