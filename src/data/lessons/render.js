// Turns a structured lesson entry into the polished HTML body consumed by
// LessonDetail.jsx (rendered inside a container via dangerouslySetInnerHTML).
// Shared by every static course (Java, Spring, Python, HTML, CSS, JavaScript,
// React, SQL, PostgreSQL, database design). Every tag carries its own
// Tailwind classes (no dependency on a typography plugin) so lessons look
// like a designed tutorial page, not raw prose, and stay correct in both
// light and dark mode.

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

// Prose supports inline emphasis; literal HTML/Java generic tags stay text.
function inlineText(value) {
  return String(value || '').replace(/<[^>]*>/g, (tag) => /^<\/?(?:code|strong|em|b|i)>$/.test(tag) ? tag : escapeHtml(tag))
}

function paragraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="mb-4 text-[15px] leading-7 text-ink-600 dark:text-ink-300">${inlineText(p)}</p>`)
    .join('')
}

function list(items) {
  if (!Array.isArray(items) || !items.length) return ''
  return `<ul class="mb-5 space-y-2.5">${items
    .map(
      (item) =>
        `<li class="flex gap-2.5 text-[15px] leading-7 text-ink-600 dark:text-ink-300"><span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"></span><span>${inlineText(item)}</span></li>`,
    )
    .join('')}</ul>`
}

function sectionHeading(text, id = '') {
  return `<h2 id="${id}" class="mb-3 mt-9 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><span class="h-4 w-1 rounded-full bg-gold-400"></span>${inlineText(text)}</h2>`
}

function renderExample(example, index, total, language) {
  const label = example.caption || (total > 1 ? `Example ${index + 1}` : 'Example')
  const code = `<div class="mt-2 overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-sm">
      <div class="flex items-center justify-between border-b border-ink-800/80 bg-ink-900/60 px-4 py-2">
        <span class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400"><span class="h-2 w-2 rounded-full bg-gold-400"></span>${language}</span>
      </div>
      <pre class="overflow-x-auto p-4 text-[13px] leading-6 text-ink-100"><code class="font-mono">${escapeHtml(example.code)}</code></pre>
    </div>`
  const output = example.output
    ? `<div class="mt-3 overflow-hidden rounded-xl border border-emerald-900/40 bg-ink-950">
        <div class="flex items-center gap-2 border-b border-emerald-900/40 bg-emerald-950/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">Output</div>
        <pre class="overflow-x-auto p-4 text-[13px] leading-6 text-emerald-200"><code class="font-mono">${escapeHtml(example.output)}</code></pre>
      </div>`
    : ''
  return `<div class="mb-6"><p class="mb-0 text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">${inlineText(label)}</p>${code}${output}</div>`
}

function calloutBlock({ title, icon, accent, items }) {
  const accents = {
    warning: {
      border: 'border-amber-300/60 dark:border-amber-500/30',
      bg: 'bg-amber-50/70 dark:bg-amber-500/[0.06]',
      title: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    success: {
      border: 'border-gold-300/60 dark:border-gold-500/30',
      bg: 'bg-gold-50/70 dark:bg-gold-500/[0.06]',
      title: 'text-gold-700 dark:text-gold-400',
      dot: 'bg-gold-500',
    },
  }
  const theme = accents[accent] || accents.success
  const itemsHtml = (items || [])
    .map(
      (item) =>
        `<li class="flex gap-2.5 text-[14px] leading-6 text-ink-700 dark:text-ink-200"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}"></span><span>${inlineText(item)}</span></li>`,
    )
    .join('')
  return `<div class="mb-6 mt-8 rounded-xl border ${theme.border} ${theme.bg} p-5">
      <p class="mb-3 flex items-center gap-2 text-sm font-bold ${theme.title}"><span aria-hidden="true">${icon}</span>${title}</p>
      <ul class="space-y-2">${itemsHtml}</ul>
    </div>`
}

/**
 * @param entry structured lesson content (title, intro, sections, examples, commonMistakes, keyPoints)
 * @param eyebrow the small label above the title, e.g. "Java Tutorial", "Python Tutorial", "SQL Tutorial"
 * @param language the code-block header label, e.g. "Java", "Python", "HTML", "CSS", "SQL", "JSX"
 */
export function renderLessonContent(entry, eyebrow = 'Tutorial', language = '') {
  const sections = Array.isArray(entry.sections) ? entry.sections : []
  const examples = Array.isArray(entry.examples) ? entry.examples : []

  const headerHtml = `<div class="mb-6 border-b border-ink-100 pb-6 dark:border-ink-800">
      <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-500">${eyebrow}</p>
      <h1 class="font-display text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl dark:text-white">${entry.title}</h1>
    </div>`

  const introHtml = paragraphs(entry.intro)

  const toc = sections.length >= 3
    ? `<nav aria-label="On this page" class="my-6 rounded-xl border border-ink-200 p-4 dark:border-ink-800"><p class="font-semibold">On this page</p><ul class="mt-2 space-y-2">${sections.map((section, index) => `<li><a class="text-gold-600 hover:underline dark:text-gold-400" href="#section-${index + 1}">${inlineText(section.heading)}</a></li>`).join('')}${examples.length ? '<li><a class="text-gold-600 hover:underline dark:text-gold-400" href="#examples">Examples</a></li>' : ''}</ul></nav>`
    : ''

  const sectionsHtml = sections
    .map((section, index) => `${sectionHeading(section.heading, `section-${index + 1}`)}${paragraphs(section.body)}${list(section.list)}`)
    .join('')

  const examplesHtml = examples.length
    ? `${sectionHeading(examples.length > 1 ? 'Examples' : 'Example', 'examples')}${examples.map((ex, i) => renderExample(ex, i, examples.length, language)).join('')}`
    : ''

  const mistakesHtml = entry.commonMistakes?.length
    ? calloutBlock({ title: 'Common Mistakes', icon: '⚠', accent: 'warning', items: entry.commonMistakes })
    : ''

  const keyPointsHtml = entry.keyPoints?.length
    ? calloutBlock({ title: 'Key Points to Remember', icon: '✓', accent: 'success', items: entry.keyPoints })
    : ''

  return `<div class="lesson-article">${headerHtml}${introHtml}${toc}${sectionsHtml}${examplesHtml}${mistakesHtml}${keyPointsHtml}</div>`
}

export function firstExampleCode(entry) {
  return entry?.examples?.[0]?.code || ''
}
