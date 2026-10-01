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

function codeBlock(code, label) {
  return `<div class="mt-2 overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-sm">
      <div class="flex items-center justify-between border-b border-ink-800/80 bg-ink-900/60 px-4 py-2">
        <span class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400"><span class="h-2 w-2 rounded-full bg-gold-400"></span>${label}</span>
      </div>
      <pre class="overflow-x-auto p-4 text-[13px] leading-6 text-ink-100"><code class="font-mono">${escapeHtml(code)}</code></pre>
    </div>`
}

// <details> keeps answers hidden until opened and needs no JavaScript, so it
// also works in the prerendered snapshot.
function reveal(summary, innerHtml) {
  return `<details class="mt-3 rounded-lg border border-ink-200 px-4 py-3 dark:border-ink-800"><summary class="cursor-pointer text-sm font-semibold text-gold-600 dark:text-gold-400">${summary}</summary><div class="mt-3">${innerHtml}</div></details>`
}

// The SVG is authored in the lesson data (trusted markup); it should draw with
// currentColor so it follows the light/dark text colour.
function renderDiagram(diagram) {
  return `<figure id="diagram" class="my-6 rounded-xl border border-ink-200 p-4 text-ink-700 dark:border-ink-800 dark:text-ink-200">
      <div class="overflow-x-auto">${diagram.svg}</div>
      <figcaption class="mt-3 text-center text-sm text-ink-500 dark:text-ink-400">${inlineText(diagram.caption)}</figcaption>
    </figure>`
}

function renderComplexity(rows) {
  const cell = 'border-b border-ink-100 px-3 py-2 text-left text-[14px] dark:border-ink-800'
  return `${sectionHeading('Time complexity', 'complexity')}<div class="mb-5 overflow-x-auto"><table class="w-full border-collapse text-ink-600 dark:text-ink-300">
      <thead><tr><th scope="col" class="${cell} font-semibold text-ink-900 dark:text-white">Operation</th><th scope="col" class="${cell} font-semibold text-ink-900 dark:text-white">Average</th><th scope="col" class="${cell} font-semibold text-ink-900 dark:text-white">Worst case</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><th scope="row" class="${cell} font-medium">${inlineText(row.operation)}</th><td class="${cell}">${inlineText(row.average)}</td><td class="${cell}">${inlineText(row.worst)}</td></tr>`).join('')}</tbody>
    </table></div>`
}

function renderProductionExample(example, language) {
  const code = example.code ? renderExample({ caption: example.caption || 'In practice', code: example.code, output: example.output }, 0, 1, language) : ''
  return `${sectionHeading(example.heading || 'Where this is used', 'in-practice')}${paragraphs(example.body)}${code}`
}

function renderExercise(exercise, language) {
  const starter = exercise.starterCode ? codeBlock(exercise.starterCode, `${language} · starter code`) : ''
  const hints = exercise.hints?.length ? reveal('Show hints', list(exercise.hints)) : ''
  const solution = exercise.solution ? reveal('Show solution', codeBlock(exercise.solution, `${language} · solution`)) : ''
  return `${sectionHeading('Exercise', 'exercise')}${paragraphs(exercise.prompt)}${starter}${hints}${solution}`
}

function renderQuiz(quiz) {
  const items = quiz.map((item, index) => {
    const options = item.options.map((option, optionIndex) =>
      `<li class="text-[15px] leading-7 text-ink-600 dark:text-ink-300"><span class="font-semibold">${String.fromCharCode(65 + optionIndex)}.</span> ${inlineText(option)}</li>`).join('')
    const answer = `<p class="text-[15px] leading-7 text-ink-700 dark:text-ink-200"><strong>${String.fromCharCode(65 + item.answer)}.</strong> ${inlineText(item.explanation)}</p>`
    return `<div class="mb-5"><p class="text-[15px] font-semibold leading-7 text-ink-900 dark:text-white">${index + 1}. ${inlineText(item.question)}</p><ul class="mt-2 space-y-1">${options}</ul>${reveal('Show answer', answer)}</div>`
  }).join('')
  return `${sectionHeading('Quick quiz', 'quiz')}${items}`
}

function renderInterviewQuestions(questions) {
  const items = questions.map((item) =>
    `<div class="mb-4"><p class="text-[15px] font-semibold leading-7 text-ink-900 dark:text-white">${inlineText(item.question)}</p>${reveal('Show answer', paragraphs(item.answer))}</div>`).join('')
  return `${sectionHeading('Interview questions', 'interview-questions')}${items}`
}

function renderSeeAlso(links) {
  return `${sectionHeading('Go deeper', 'go-deeper')}<ul class="mb-5 space-y-2">${links.map((link) =>
    `<li><a class="text-gold-600 underline dark:text-gold-400" href="/learn/lessons/${encodeURIComponent(link.lessonId)}">${inlineText(link.label)}</a></li>`).join('')}</ul>`
}

/**
 * @param entry structured lesson content (title, intro, sections, examples, commonMistakes, keyPoints).
 *   Optional practice blocks: whyItMatters, diagram, complexity, productionExample, exercise, quiz,
 *   interviewQuestions, seeAlso. A lesson without them renders exactly as before.
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

  const tocLink = (id, label) => `<li><a class="text-gold-600 hover:underline dark:text-gold-400" href="#${id}">${label}</a></li>`
  const practiceLinks = [
    entry.exercise && tocLink('exercise', 'Exercise'),
    entry.quiz?.length && tocLink('quiz', 'Quick quiz'),
    entry.interviewQuestions?.length && tocLink('interview-questions', 'Interview questions'),
  ].filter(Boolean).join('')

  const toc = sections.length >= 3
    ? `<nav aria-label="On this page" class="my-6 rounded-xl border border-ink-200 p-4 dark:border-ink-800"><p class="font-semibold">On this page</p><ul class="mt-2 space-y-2">${sections.map((section, index) => `<li><a class="text-gold-600 hover:underline dark:text-gold-400" href="#section-${index + 1}">${inlineText(section.heading)}</a></li>`).join('')}${examples.length ? '<li><a class="text-gold-600 hover:underline dark:text-gold-400" href="#examples">Examples</a></li>' : ''}${practiceLinks}</ul></nav>`
    : ''

  const whyHtml = entry.whyItMatters ? `${sectionHeading('Why it matters', 'why-it-matters')}${paragraphs(entry.whyItMatters)}` : ''
  const diagramHtml = entry.diagram?.svg ? renderDiagram(entry.diagram) : ''
  const complexityHtml = entry.complexity?.length ? renderComplexity(entry.complexity) : ''
  const productionHtml = entry.productionExample ? renderProductionExample(entry.productionExample, language) : ''
  const exerciseHtml = entry.exercise ? renderExercise(entry.exercise, language) : ''
  const quizHtml = entry.quiz?.length ? renderQuiz(entry.quiz) : ''
  const interviewHtml = entry.interviewQuestions?.length ? renderInterviewQuestions(entry.interviewQuestions) : ''
  const seeAlsoHtml = entry.seeAlso?.length ? renderSeeAlso(entry.seeAlso) : ''

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

  return `<div class="lesson-article">${headerHtml}${introHtml}${whyHtml}${toc}${diagramHtml}${sectionsHtml}${complexityHtml}${examplesHtml}${productionHtml}${mistakesHtml}${exerciseHtml}${quizHtml}${interviewHtml}${keyPointsHtml}${seeAlsoHtml}</div>`
}

export function firstExampleCode(entry) {
  return entry?.examples?.[0]?.code || ''
}
