import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalUrl, summarize, breadcrumbSchema, validLastmod } from '../src/lib/seo.js'
import { SAMPLE_COURSES, SAMPLE_LESSONS } from '../src/data/codelabDefaults.js'
import { lessonTemplate, lessonWorkspace } from '../src/lib/lessonPlayground.js'
import { COMMERCIAL_PAGES, SERVICE_DIRECTORY } from '../src/data/commercialPages.js'
import { COURSE_RELATIONS } from '../src/data/contentRelations.js'
import { getCaseStudy } from '../src/data/caseStudies.js'
import { LESSON_VIDEOS, videoObjectSchema } from '../src/data/lessonVideos.js'

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

test('commercial pages have unique metadata and only link to real pages', () => {
  const services = new Set(['/services/web-development', ...COMMERCIAL_PAGES.map((page) => page.path)])
  const courses = new Set(SAMPLE_COURSES.map((course) => `/learn/${course.slug}`))
  const seen = new Set()
  for (const page of COMMERCIAL_PAGES) {
    for (const value of [page.seo.title, page.seo.description, page.h1]) {
      assert.ok(!seen.has(value), `duplicate: ${value}`)
      seen.add(value)
    }
    assert.ok(page.seo.description.length <= 160, `${page.path} description length`)
    assert.ok(getCaseStudy(page.proof.caseStudy), `${page.path} case study`)
    page.learning.forEach((link) => assert.ok(courses.has(link.to), link.to))
    page.related.forEach((to) => assert.ok(services.has(to), to))
    // Guard against invented metrics creeping into sales copy.
    assert.ok(!/\d+\s?%|\d+\+ (clients|projects)|rated|award/i.test(JSON.stringify(page)), `${page.path} has no unverified figures`)
  }
  SERVICE_DIRECTORY.forEach((item) => assert.ok(services.has(item.to), item.to))
})

test('every course links to an existing service and case study', () => {
  const services = new Set(['/services/web-development', ...COMMERCIAL_PAGES.map((page) => page.path)])
  for (const course of SAMPLE_COURSES) {
    const relation = COURSE_RELATIONS[course.slug]
    assert.ok(relation && services.has(relation.service), course.slug)
    if (relation.caseStudy) assert.ok(getCaseStudy(relation.caseStudy), relation.caseStudy)
  }
})

test('every lesson video belongs to a real lesson and has complete VideoObject data', () => {
  for (const [lessonId, entry] of Object.entries(LESSON_VIDEOS)) {
    assert.ok(SAMPLE_LESSONS[lessonId], `video for missing lesson ${lessonId}`)
    for (const video of [].concat(entry)) {
      const schema = videoObjectSchema(video)
      assert.ok(schema, `${video.youtubeId}: needs uploadDate from YouTube`)
      assert.ok(!Number.isNaN(Date.parse(schema.uploadDate)), `${video.youtubeId}: valid uploadDate`)
      assert.match(schema.duration || '', /^PT(\d+M)?(\d+S)?$/, `${video.youtubeId}: duration`)
      assert.ok(schema.name && schema.description && schema.thumbnailUrl.length, `${video.youtubeId}: name, description, thumbnail`)
    }
  }
  assert.equal(videoObjectSchema({ youtubeId: 'x', title: 't', description: 'd', uploadDate: '2026-01-01', durationSeconds: 80 }).duration, 'PT1M20S')
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
  const java = 'public class Demo {\n    public static void main(String[] args) { }\n}\n'
  const javaLesson = { id: 'j', course_slug: 'java-core', language: 'java', examples: [{ code: java }], exercise_starter: java }
  assert.equal(lessonTemplate(javaLesson).files[0].name, 'Demo.java')
  assert.equal(lessonTemplate({ ...javaLesson, course_slug: 'spring-boot' }), null, 'framework Java needs a project')
  assert.equal(lessonWorkspace(javaLesson, 'exercise').source, java)
  const advancedLesson = { ...javaLesson, course_slug: 'advanced-java' }
  assert.equal(lessonTemplate(advancedLesson), null, 'Advanced Java examples need libraries')
  assert.equal(lessonWorkspace(advancedLesson, 'exercise').source, java, 'JDK-only Advanced Java exercises run')
  assert.equal(lessonWorkspace({ ...advancedLesson, exercise_starter: '' }, 'exercise'), null)
  assert.equal(lessonWorkspace({ ...lesson, examples: [{ code, runnable: false }], exercise_starter: code }, 'exercise'), null)
  const css = lessonTemplate({ ...lesson, language: 'css', course_slug: 'css' })
  assert.equal(css.selectedFile, 'style.css')
  assert.equal(css.files.find((file) => file.name === 'style.css').content, code)
})
