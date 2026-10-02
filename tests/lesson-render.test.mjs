import test from 'node:test'
import assert from 'node:assert/strict'
import { renderLessonContent } from '../src/data/lessons/render.js'
import { SAMPLE_LESSONS } from '../src/data/codelabDefaults.js'
import { JAVA_LESSON_CONTENT, JAVA_PRACTICE } from '../src/data/java/index.js'
import { TUTORIALS_BY_COURSE, TUTORIAL_PRACTICE } from '../src/data/tutorials/index.js'

const base = {
  title: 'Sample', intro: 'Intro.',
  sections: [{ heading: 'One', body: 'a' }, { heading: 'Two', body: 'b' }, { heading: 'Three', body: 'c' }],
  examples: [{ code: 'x', output: 'y' }], commonMistakes: ['m'], keyPoints: ['k'],
}

test('lessons without practice blocks render no practice markup', () => {
  const html = renderLessonContent(base, 'Java Tutorial', 'Java')
  for (const id of ['why-it-matters', 'diagram', 'complexity', 'in-practice', 'exercise', 'quiz', 'interview-questions', 'go-deeper']) {
    assert.ok(!html.includes(`id="${id}"`), id)
  }
  assert.ok(!html.includes('<details'))
  assert.ok(!html.includes('<figure'))
})

test('practice blocks render once, escape code and hide answers', () => {
  const html = renderLessonContent({
    ...base,
    whyItMatters: 'Because.',
    diagram: { caption: 'A diagram', svg: '<svg viewBox="0 0 1 1"></svg>' },
    complexity: [{ operation: 'get', average: 'O(1)', worst: 'O(n)' }],
    productionExample: { body: 'Used for counting.', code: 'Map<String, Integer> m;', output: '1' },
    exercise: { prompt: 'Do it.', starterCode: 'List<String> a;', hints: ['hint'], solution: 'List<String> b;' },
    quiz: [{ question: 'Q?', options: ['a', 'b'], answer: 1, explanation: 'Because b.' }],
    interviewQuestions: [{ question: 'Why?', answer: 'Reason.' }],
    seeAlso: [{ lessonId: 'lesson_x', label: 'Lesson X' }],
  }, 'Java Tutorial', 'Java')

  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  for (const id of ['why-it-matters', 'diagram', 'complexity', 'in-practice', 'exercise', 'quiz', 'interview-questions', 'go-deeper']) {
    assert.equal(html.split(`id="${id}"`).length - 1, 1, id)
  }
  assert.ok(html.includes('<svg viewBox="0 0 1 1"></svg>'), 'diagram markup is kept')
  assert.ok(html.includes('Map&lt;String, Integer&gt; m;') && html.includes('List&lt;String&gt; b;'), 'code is escaped')
  assert.ok(!html.includes('List<String>'))
  // hints, solution, quiz answer, interview answer
  assert.equal((html.match(/<details/g) || []).length, 4)
  assert.ok(html.indexOf('Because b.') > html.indexOf('Show answer'), 'quiz answer sits inside the reveal')
  assert.ok(html.includes('href="#exercise"') && html.includes('href="#quiz"'), 'contents list links to practice blocks')
  assert.ok(html.includes('href="/learn/lessons/lesson_x"'))
})

test('every practice entry attaches to an existing lesson and is well formed', () => {
  const groups = [
    ['java', JAVA_PRACTICE, JAVA_LESSON_CONTENT],
    ...Object.entries(TUTORIAL_PRACTICE).map(([course, practice]) => [course, practice, TUTORIALS_BY_COURSE[course]]),
  ]
  for (const [course, entries, lessons] of groups) {
    for (const [key, practice] of Object.entries(entries)) {
      const slug = `${course}/${key}`
      assert.ok(lessons?.[key]?.title, `practice for unknown lesson: ${slug}`)
      assert.ok(!('examples' in practice) && !('sections' in practice), `${slug}: practice must not replace lesson prose`)
      for (const item of practice.quiz || []) {
        assert.ok(item.options.length >= 2 && item.answer >= 0 && item.answer < item.options.length, `${slug}: quiz answer index`)
        assert.ok(item.explanation, `${slug}: quiz explanation`)
      }
      if (practice.exercise) assert.ok(practice.exercise.prompt && practice.exercise.solution, `${slug}: exercise needs a prompt and solution`)
    }
  }
})

test('see-also links in real lessons point at existing lessons', () => {
  for (const lesson of Object.values(SAMPLE_LESSONS)) {
    for (const match of lesson.content.body.matchAll(/href="\/learn\/lessons\/([^"]+)"/g)) {
      assert.ok(SAMPLE_LESSONS[decodeURIComponent(match[1])], `${lesson.id} links to missing lesson ${match[1]}`)
    }
  }
})
