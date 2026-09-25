import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalUrl, summarize, breadcrumbSchema, validLastmod } from '../src/lib/seo.js'
import { SAMPLE_COURSES, SAMPLE_LESSONS } from '../src/data/codelabDefaults.js'
import { lessonTemplate } from '../src/lib/lessonPlayground.js'

test('canonical URLs discard queries, fragments, trailing slashes and foreign hosts', () => {
  assert.equal(canonicalUrl('/learn/java-core/?utm_source=share#intro'), 'https://www.webneststudio.co.in/learn/java-core')
  assert.equal(canonicalUrl('https://preview.example/learn'), 'https://www.webneststudio.co.in/learn')
  assert.equal(canonicalUrl(), 'https://www.webneststudio.co.in/')
})

test('descriptions are readable plain text and dates never default to today', () => {
  assert.equal(summarize('<p>Java &amp; Python</p>'), 'Java & Python')
  assert.ok(summarize('A useful description '.repeat(20)).length <= 160)
  assert.equal(validLastmod(), undefined)
  assert.equal(validLastmod('bad date'), undefined)
  assert.equal(validLastmod('2099-01-01'), undefined)
  assert.equal(validLastmod('2026-01-12T12:00:00Z'), '2026-01-12')
})

test('every course link resolves to a canonical lesson with unique metadata and one H1', () => {
  const titles = new Set()
  const descriptions = new Set()
  const linked = new Set()
  for (const course of SAMPLE_COURSES) {
    for (const module of course.modules) {
      for (const item of module.lessons) {
        const lesson = SAMPLE_LESSONS[item.id]
        assert.ok(lesson, item.id)
        assert.equal(lesson.id, item.id)
        assert.equal(lesson.course_slug, course.slug)
        assert.equal((lesson.content.body.match(/<h1\b/g) || []).length, 1, item.id)
        assert.ok(lesson.description.length > 30, item.id)
        assert.ok(!titles.has(lesson.seo_title), lesson.seo_title)
        assert.ok(!descriptions.has(lesson.description), lesson.description)
        titles.add(lesson.seo_title)
        descriptions.add(lesson.description)
        linked.add(item.id)
      }
    }
  }
  for (const lesson of Object.values(SAMPLE_LESSONS)) assert.ok(lesson && linked.has(lesson.id), 'No broken aliases or orphan lessons')
})

test('breadcrumbs use ordered canonical links', () => {
  const schema = breadcrumbSchema([{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }])
  assert.equal(schema.itemListElement[1].position, 2)
  assert.equal(schema.itemListElement[1].item, canonicalUrl('/learn'))
})

test('lesson templates preserve exact code and only use supported runtimes', () => {
  const code = 'print("<hello>")\n'
  const lesson = { id: 'test', course_slug: 'python', language: 'python', examples: [{ code }] }
  assert.equal(lessonTemplate(lesson).files[0].content, code)
  assert.equal(lessonTemplate({ ...lesson, language: 'java' }), null)
  assert.equal(lessonTemplate({ ...lesson, language: 'javascript', course_slug: 'react' }), null)
  assert.equal(lessonTemplate(lesson, 50), null)
  assert.equal(lessonTemplate({ ...lesson, examples: [{ code: '# Terminal\npython3 --version' }] }), null)
  const css = lessonTemplate({ ...lesson, language: 'css', course_slug: 'css' })
  assert.equal(css.selectedFile, 'style.css')
  assert.equal(css.files.find((file) => file.name === 'style.css').content, code)
})
