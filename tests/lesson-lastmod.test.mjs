import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { indexableLessonIds, isLessonCurrent } from '../scripts/lesson-hash.mjs'

// The build only reads scripts/lesson-lastmod.json: a lesson edited without regenerating it
// ships with no <lastmod> in the sitemap. Fail here instead of in production.
test('every indexable lesson has a current lastmod (run `npm run sitemap` after editing lessons)', async () => {
  const manifest = JSON.parse(await readFile(new URL('../scripts/lesson-lastmod.json', import.meta.url), 'utf8'))
  const stale = indexableLessonIds().filter((id) => !isLessonCurrent(id, manifest[id]) || !/^\d{4}-\d{2}-\d{2}$/.test(manifest[id]?.lastmod ?? ''))
  assert.deepEqual(stale.slice(0, 20), [], `${stale.length} lesson(s) need \`npm run sitemap\``)
})
