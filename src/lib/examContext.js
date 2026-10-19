import { SAMPLE_COURSES, tutorialEntry } from '../data/codelabDefaults.js'

// What the final-exam question generator is told about a course module, so its questions
// follow what the lessons teach (COURSE_EXAMS_CERTIFICATES.md, "Question bank").
// Used by the admin exam-bank page and scripts/sync-learning-catalog.mjs.

// Short course codes printed in certificate IDs: WNS-<CODE>-<YEAR>-<RANDOM>.
export const EXAM_CODES = {
  'java-core': 'JAVA',
  'advanced-java': 'ADVJAVA',
  'spring-framework': 'SPRING',
  'spring-boot': 'BOOT',
  python: 'PY',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JS',
  react: 'REACT',
  'database-sql': 'SQL',
  postgresql: 'PG',
  'database-design': 'DBDESIGN',
}

const MAX_TEXT = 600

function plain(html) {
  return String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function clip(text) {
  const value = plain(text)
  return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT - 1)}…` : value
}

export function moduleExamContext(course, module) {
  return {
    course_slug: course.slug,
    course_title: course.title,
    module_id: module.id,
    module_title: module.title,
    lessons: module.lessons.map((lesson) => {
      const entry = tutorialEntry(course.slug, lesson.title)
      return {
        lesson_id: lesson.id,
        title: lesson.title,
        summary: clip(entry?.intro ?? ''),
        key_points: (entry?.keyPoints ?? []).map(clip).slice(0, 12),
        // Public practice questions (their answers ship with the site): the generator must not
        // reuse or closely paraphrase them.
        avoid_prompts: (entry?.quiz ?? []).map((item) => clip(item.question)),
      }
    }),
  }
}

// A course's outline for PUT /api/admin/learning/courses: structure only (lesson content
// stays on the site). Modules and lessons are matched by `key`, so re-uploading is safe.
export function courseCatalogPayload(course) {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    description: course.description,
    status: 'published',
    display_order: Math.max(0, SAMPLE_COURSES.indexOf(course)),
    exam_code: EXAM_CODES[course.slug],
    modules: course.modules.map((module, moduleIndex) => ({
      key: module.id,
      title: module.title,
      display_order: moduleIndex,
      status: 'published',
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        key: lesson.id,
        title: lesson.title,
        display_order: lessonIndex,
        status: 'published',
      })),
    })),
  }
}

export function courseExamContexts(courseSlug) {
  const course = SAMPLE_COURSES.find((item) => item.slug === courseSlug)
  return course ? course.modules.map((module) => moduleExamContext(course, module)) : []
}
