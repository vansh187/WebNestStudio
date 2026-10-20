import { createHash } from 'node:crypto'
import { SAMPLE_LESSONS } from '../src/data/codelabDefaults.js'
import { getLessonVideo } from '../src/data/lessonVideos.js'

// Shared by generate-sitemap.mjs (which dates lessons in scripts/lesson-lastmod.json) and
// tests/lesson-lastmod.test.mjs (which fails when that manifest is out of date).
export const shortHash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)

// Covers everything LessonDetail renders: the whole lesson record (body, examples,
// practice, resources...) plus any spliced-in video.
export const lessonHash = (id) => shortHash([SAMPLE_LESSONS[id], getLessonVideo(id)])

// Pre-2026-10-08 manifests hashed only these fields; matching one keeps its date
// instead of bumping every lesson at once. Safe to drop once the manifest is rewritten.
export const legacyLessonHash = (lesson) => shortHash([lesson.seo_title, lesson.description, lesson.content.body])

export const indexableLessonIds = () => Object.keys(SAMPLE_LESSONS).filter((id) => SAMPLE_LESSONS[id]?.id === id && SAMPLE_LESSONS[id].indexable)

export const isLessonCurrent = (id, known) => Boolean(known && (known.hash === lessonHash(id) || known.hash === legacyLessonHash(SAMPLE_LESSONS[id])))
