import test from 'node:test'
import assert from 'node:assert/strict'

// A minimal localStorage and window for the browser-only progress store. `quota.full` makes
// writes of the (large) progress key fail, as a full browser storage would.
const store = new Map()
const quota = { full: false }
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => {
    if (quota.full && key.startsWith('wns-learning-progress:')) throw new Error('QuotaExceededError')
    store.set(key, String(value))
  },
  removeItem: (key) => { store.delete(key) },
}
const events = []
const target = new EventTarget()
globalThis.window = {
  addEventListener: (...args) => target.addEventListener(...args),
  removeEventListener: (...args) => target.removeEventListener(...args),
  dispatchEvent: (event) => { events.push(event); return target.dispatchEvent(event) },
}
globalThis.CustomEvent ??= class extends Event {
  constructor(type, init) { super(type); this.detail = init?.detail }
}

const {
  createProgressRefresher, hydrateProgressFromServer, mergeServerProgress, readLearningProgress, subscribeProgressChanges, unsyncedCompletions,
  writeLearningProgress, PROGRESS_CHANGED_EVENT,
} = await import('../src/lib/learningProgress.js')
const { SAMPLE_COURSES } = await import('../src/data/codelabDefaults.js')

const lessons = SAMPLE_COURSES.flatMap((course) => course.modules.flatMap((module) => module.lessons ?? []))
const [A, B, C] = lessons.map((lesson) => lesson.id)
const USER = 'learner@example.com'
const reset = () => { store.clear(); events.length = 0; quota.full = false }
// Local progress already in the store before the test acts; its write event is not counted.
const seed = (progress) => { writeLearningProgress(USER, progress); events.length = 0 }
const PULLED = `wns-learning-pulled:${USER}`
const done =(id) => ({ key: id, status: 'completed', completed_percent: 100 })

test('merge never downgrades, keeps bookmarks, and takes the higher percent', () => {
  reset()
  writeLearningProgress(USER, {
    [A]: { status: 'completed', completed_percent: 100, bookmarked: true },
    [B]: { status: 'in_progress', completed_percent: 60, bookmarked: false },
  })
  const merged = mergeServerProgress(USER, [
    { key: A, status: 'in_progress', completed_percent: 10 }, // server behind: local completed wins
    { key: B, status: 'in_progress', completed_percent: 40 }, // local percent is higher
    { key: C, status: 'completed', completed_percent: 100 }, // only on the server
  ])
  assert.deepEqual(merged[A], { status: 'completed', completed_percent: 100, bookmarked: true })
  assert.deepEqual(merged[B], { status: 'in_progress', completed_percent: 60, bookmarked: false })
  assert.deepEqual(merged[C], { status: 'completed', completed_percent: 100, bookmarked: false })
  assert.deepEqual(readLearningProgress(USER), merged, 'written to the store')
})

test('merge upgrades in_progress to completed and skips unusable entries', () => {
  reset()
  writeLearningProgress(USER, { [A]: { status: 'in_progress', completed_percent: 30, bookmarked: false } })
  const merged = mergeServerProgress(USER, [
    { key: A, status: 'completed', completed_percent: 100 },
    { key: null, status: 'completed' }, // created before keys existed
    { key: B, status: 'not_started' }, // never listed by the contract, ignored if it is
    { key: C, status: 'weird' },
    'garbage',
  ])
  assert.equal(merged[A].status, 'completed')
  assert.equal(merged[A].completed_percent, 100)
  assert.equal(merged[B], undefined)
  assert.equal(merged[C], undefined)
  assert.deepEqual(mergeServerProgress(USER, null), merged, 'a missing list changes nothing')
})

test('server completions are marked synced, so they are never uploaded again', () => {
  reset()
  mergeServerProgress(USER, [{ key: A, status: 'completed', completed_percent: 100 }])
  assert.deepEqual(unsyncedCompletions(USER), [])
})

test('hydrate uploads local-only completions first, then merges, then notifies', async () => {
  reset()
  writeLearningProgress(USER, { [A]: { status: 'completed', completed_percent: 100, bookmarked: false } })
  const calls = []
  const api = {
    upload: async (batch) => { calls.push(['upload', batch.map((item) => item.lesson_id)]); return { updated: batch.length } },
    fetchProgress: async (params) => {
      calls.push(['fetch', params ?? null])
      return { lessons: [{ key: B, status: 'completed', completed_percent: 100 }], server_time: '2026-10-26T09:15:00Z' }
    },
  }
  assert.equal(await hydrateProgressFromServer(USER, api), true)
  assert.deepEqual(calls, [['upload', [A]], ['fetch', null]])
  const progress = readLearningProgress(USER)
  assert.equal(progress[A].status, 'completed')
  assert.equal(progress[B].status, 'completed')
  assert.equal(events.at(-1).type, PROGRESS_CHANGED_EVENT)
  assert.equal(events.at(-1).detail.userKey, USER)

  // An incremental refresh asks only for rows since the last server_time.
  calls.length = 0
  await hydrateProgressFromServer(USER, api, { incremental: true })
  assert.deepEqual(calls.at(-1), ['fetch', { since: '2026-10-26T09:15:00Z' }])
})

test('hydrate never throws and keeps local ticks when the server fails', async () => {
  reset()
  seed({ [A]: { status: 'completed', completed_percent: 100, bookmarked: false } })
  const api = { upload: async () => ({}), fetchProgress: async () => { throw Object.assign(new Error('Not Found'), { response: { status: 404 } }) } }
  assert.equal(await hydrateProgressFromServer(USER, api), false)
  assert.equal(readLearningProgress(USER)[A].status, 'completed')
  assert.equal(events.length, 0, 'no change event on failure')
  assert.equal(await hydrateProgressFromServer(null, api), false)
})

test('one pull per user at a time', async () => {
  reset()
  let fetches = 0
  const api = { fetchProgress: async () => { fetches += 1; await new Promise((resolve) => setTimeout(resolve, 20)); return { lessons: [] } } }
  await Promise.all([hydrateProgressFromServer(USER, api), hydrateProgressFromServer(USER, api), hydrateProgressFromServer(USER, api)])
  assert.equal(fetches, 1)
})

test('a not_started entry (an un-mark from a `since` pull) never undoes a completion', () => {
  reset()
  writeLearningProgress(USER, { [A]: { status: 'completed', completed_percent: 100, bookmarked: false } })
  const merged = mergeServerProgress(USER, [{ key: A, status: 'not_started', completed_percent: 0 }])
  assert.deepEqual(merged[A], { status: 'completed', completed_percent: 100, bookmarked: false })
})

test('repeated entries merge to the same result, and merging twice changes nothing', () => {
  reset()
  const entries = [
    { key: A, status: 'in_progress', completed_percent: 40 },
    { key: A, status: 'completed', completed_percent: 100 },
    { key: A, status: 'in_progress', completed_percent: 40 },
  ]
  const once = mergeServerProgress(USER, entries)
  assert.deepEqual(once[A], { status: 'completed', completed_percent: 100, bookmarked: false })
  assert.deepEqual(mergeServerProgress(USER, entries), once)
})

test('an alias key is stored under the lesson id its course outline uses', () => {
  reset()
  const merged = mergeServerProgress(USER, [{ key: 'lesson_java_overview', status: 'completed', completed_percent: 100 }])
  assert.equal(merged.lesson_java_core_history_and_features_of_java?.status, 'completed')
  assert.equal(merged.lesson_java_overview, undefined)
  assert.deepEqual(unsyncedCompletions(USER), [], 'marked synced under the canonical id')
})

// A course's first lesson, so a per-course page can return a row of its own.
const firstLessonOf = (course) => course.modules.flatMap((module) => module.lessons ?? [])[0]?.id

test('a complete pull stores server_time; the next incremental pull sends it as `since`', async () => {
  reset()
  const calls = []
  const api = { fetchProgress: async (params) => { calls.push(params ?? null); return { lessons: [done(A)], server_time: '2026-10-26T10:00:00Z', truncated: false } } }
  await hydrateProgressFromServer(USER, api)
  assert.equal(store.get(PULLED), '2026-10-26T10:00:00Z')
  await hydrateProgressFromServer(USER, api, { incremental: true })
  assert.deepEqual(calls, [null, { since: '2026-10-26T10:00:00Z' }])
})

test('a truncated pull fetches the rest course by course (review #2)', async () => {
  reset()
  const calls = []
  const api = {
    fetchProgress: async (params) => {
      calls.push(params ?? null)
      if (!params?.course_slug) return { lessons: [done(A)], server_time: '2026-10-26T10:00:00Z', truncated: true }
      const course = SAMPLE_COURSES.find((item) => item.slug === params.course_slug)
      return { lessons: [done(firstLessonOf(course))], server_time: '2026-10-26T10:00:01Z', truncated: false }
    },
  }
  assert.equal(await hydrateProgressFromServer(USER, api), true)
  assert.equal(calls.length, 1 + SAMPLE_COURSES.length, 'one request per course after the truncated one')
  const progress = readLearningProgress(USER)
  for (const course of SAMPLE_COURSES) assert.equal(progress[firstLessonOf(course)]?.status, 'completed', course.slug)
  assert.equal(store.get(PULLED), '2026-10-26T10:00:00Z', 'every course arrived, so the first server_time is kept')
})

test('a truncated course page, or a failed one, leaves no server_time; a 404 course has no rows (review #2)', async () => {
  reset()
  const [unknownCourse, truncatedCourse] = SAMPLE_COURSES
  const pages = (failure) => async (params) => {
    if (!params?.course_slug) return { lessons: [done(A)], server_time: '2026-10-26T10:00:00Z', truncated: true }
    if (params.course_slug === unknownCourse.slug) throw Object.assign(new Error('Not Found'), { response: { status: 404 } })
    if (params.course_slug === truncatedCourse.slug) return failure()
    return { lessons: [], server_time: '2026-10-26T10:00:01Z', truncated: false }
  }
  // Only a 404 course: nothing is missing.
  await hydrateProgressFromServer(USER, { fetchProgress: pages(() => ({ lessons: [], truncated: false })) })
  assert.equal(store.get(PULLED), '2026-10-26T10:00:00Z')
  // A course page that is itself truncated.
  await hydrateProgressFromServer(USER, { fetchProgress: pages(() => ({ lessons: [], truncated: true })) })
  assert.equal(store.has(PULLED), false)
  // A course page that fails with 503.
  store.set(PULLED, 'x')
  await hydrateProgressFromServer(USER, { fetchProgress: pages(() => { throw Object.assign(new Error('Unavailable'), { response: { status: 503 } }) }) })
  assert.equal(store.has(PULLED), false)
  assert.equal(readLearningProgress(USER)[A].status, 'completed', 'what did arrive is merged')
})

test('a pull that outlives its session merges nothing into the old account (review #1)', async () => {
  reset()
  const session = { user: USER }
  const OTHER = 'other@example.com'
  const api = {
    currentUserKey: () => session.user,
    upload: async (batch) => ({ updated: batch.length }),
    // The response lands after USER signed out and OTHER signed in: it is OTHER's progress.
    fetchProgress: async () => { session.user = OTHER; return { lessons: [done(B)], server_time: '2026-10-26T10:00:00Z', truncated: false } },
  }
  assert.equal(await hydrateProgressFromServer(USER, api), false)
  assert.equal(readLearningProgress(USER)[B], undefined)
  assert.equal(store.has(PULLED), false)
  assert.equal(events.length, 0)
})

test('nothing is uploaded or fetched for an account that already signed out (review #1)', async () => {
  reset()
  seed({ [A]: { status: 'completed', completed_percent: 100, bookmarked: false } })
  const calls = []
  const session = { user: USER }
  const api = {
    currentUserKey: () => session.user,
    upload: async () => { calls.push('upload'); return {} },
    fetchProgress: async () => { calls.push('fetch'); return { lessons: [] } },
  }
  session.user = null
  assert.equal(await hydrateProgressFromServer(USER, api), false)
  assert.deepEqual(calls, [])
  assert.deepEqual(unsyncedCompletions(USER).map((item) => item.lesson_id), [A], 'still waiting to upload for USER')

  // Signing out while the upload runs: the fetch never happens.
  session.user = USER
  api.upload = async (batch) => { calls.push('upload'); session.user = null; return { updated: batch.length } }
  assert.equal(await hydrateProgressFromServer(USER, api), false)
  assert.deepEqual(calls, ['upload'])
})

test('storage full: the merge stays in memory, nothing is marked synced, no server_time (review #3, #9)', async () => {
  reset()
  quota.full = true
  const api = { fetchProgress: async () => ({ lessons: [done(A)], server_time: '2026-10-26T10:00:00Z', truncated: false }) }
  assert.equal(await hydrateProgressFromServer(USER, api), true)
  assert.equal(readLearningProgress(USER)[A]?.status, 'completed', 'pages still see the tick this session')
  assert.equal(store.has(`wns-learning-progress:${USER}`), false, 'nothing was saved')
  assert.equal(store.has(`wns-learning-synced:${USER}`), false, 'not marked synced while missing from the store')
  assert.equal(store.has(PULLED), false, 'the next pull is full, not incremental')
  assert.equal(events.at(-1)?.type, PROGRESS_CHANGED_EVENT, 'pages are told to re-read')

  // The same rows again, storage still full: still not synced, still no server_time.
  await hydrateProgressFromServer(USER, api)
  assert.equal(store.has(`wns-learning-synced:${USER}`), false)
  assert.equal(store.has(PULLED), false)

  // Space frees up and the page saves what it read: the in-memory ticks are saved with it.
  quota.full = false
  const all = readLearningProgress(USER)
  all[B] = { status: 'completed', completed_percent: 100, bookmarked: false }
  assert.equal(writeLearningProgress(USER, all), true)
  const saved = JSON.parse(store.get(`wns-learning-progress:${USER}`))
  assert.equal(saved[A].status, 'completed')
  assert.equal(saved[B].status, 'completed')
})

test('a pull that changes nothing writes nothing and notifies no one (review #5)', async () => {
  reset()
  seed({ [A]: { status: 'completed', completed_percent: 100, bookmarked: true } })
  const before = store.get(`wns-learning-progress:${USER}`)
  let writes = 0
  const setItem = localStorage.setItem
  localStorage.setItem = (key, value) => { if (key.startsWith('wns-learning-progress:')) writes += 1; setItem(key, value) }
  try {
    const api = { fetchProgress: async () => ({ lessons: [done(A), { key: A, status: 'in_progress', completed_percent: 20 }], server_time: '2026-10-26T10:00:00Z', truncated: false }) }
    assert.equal(await hydrateProgressFromServer(USER, api), true)
    assert.equal(writes, 0)
    assert.equal(events.length, 0)
    assert.equal(store.get(`wns-learning-progress:${USER}`), before)
    assert.equal(store.get(PULLED), '2026-10-26T10:00:00Z', 'still a complete pull')
    assert.deepEqual(unsyncedCompletions(USER), [], 'the server has A, so it is not uploaded')
  } finally {
    localStorage.setItem = setItem
  }
})

test('a full pull asked for during an incremental one still runs in full (review #6)', async () => {
  reset()
  store.set(PULLED, '2026-10-26T09:00:00Z')
  const calls = []
  const api = { fetchProgress: async (params) => { calls.push(params ?? null); await new Promise((resolve) => setTimeout(resolve, 10)); return { lessons: [], server_time: '2026-10-26T10:00:00Z' } } }
  const incremental = hydrateProgressFromServer(USER, api, { incremental: true })
  const full = hydrateProgressFromServer(USER, api)
  const fullAgain = hydrateProgressFromServer(USER, api)
  assert.deepEqual(await Promise.all([incremental, full, fullAgain]), [true, true, true])
  assert.deepEqual(calls, [{ since: '2026-10-26T09:00:00Z' }, null], 'one incremental, then one full')

  // An incremental pull asked for during a full one reuses it.
  calls.length = 0
  await Promise.all([hydrateProgressFromServer(USER, api), hydrateProgressFromServer(USER, api, { incremental: true })])
  assert.deepEqual(calls, [null])
})

test('pages hear about writes here, server pulls, and writes in other tabs (review #7)', async () => {
  reset()
  let heard = 0
  const unsubscribe = subscribeProgressChanges(USER, () => { heard += 1 })
  writeLearningProgress(USER, { [A]: { status: 'completed', completed_percent: 100, bookmarked: false } })
  assert.equal(heard, 1, 'a write on this page (markComplete, toggleBookmark)')

  await hydrateProgressFromServer(USER, { fetchProgress: async () => ({ lessons: [done(B)] }) })
  assert.equal(heard, 2, 'a server pull that changed something')

  const storageEvent = (key) => Object.assign(new Event('storage'), { key })
  window.dispatchEvent(storageEvent(`wns-learning-progress:${USER}`))
  assert.equal(heard, 3, 'another tab wrote this user\'s progress')
  window.dispatchEvent(storageEvent(null))
  assert.equal(heard, 4, 'another tab cleared storage')
  window.dispatchEvent(storageEvent('wns-learning-progress:other@example.com'))
  window.dispatchEvent(storageEvent('wns_refresh_token'))
  writeLearningProgress('other@example.com', {})
  assert.equal(heard, 4, 'other accounts and other keys are ignored')

  unsubscribe()
  writeLearningProgress(USER, {})
  assert.equal(heard, 4, 'nothing after unsubscribing')
  assert.equal(typeof subscribeProgressChanges(null, () => {}), 'function', 'signed out: a no-op unsubscribe')
})

test('refresher: a failed login pull is retried after retryMs, not the full 5 minutes (review #4)', async () => {
  reset()
  let clock = 0
  const calls = []
  let fail = true
  const api = {
    fetchProgress: async (params) => {
      calls.push(params ?? null)
      if (fail) throw Object.assign(new Error('Unavailable'), { response: { status: 503 } })
      return { lessons: [], server_time: '2026-10-26T10:00:00Z' }
    },
  }
  const refresher = createProgressRefresher(USER, api, { refreshMs: 300_000, retryMs: 30_000, now: () => clock })
  assert.equal(await refresher.pull(), false)

  clock = 10_000
  assert.equal(await refresher.refresh(), false)
  assert.equal(calls.length, 1, 'too soon to retry')

  clock = 31_000
  fail = false
  assert.equal(await refresher.refresh(), true)
  assert.deepEqual(calls.at(-1), null, 'the retry is a full pull, since the login pull never succeeded')

  clock = 31_000 + 299_000
  await refresher.refresh()
  assert.equal(calls.length, 2, 'after a success, focus waits refreshMs')

  clock = 31_000 + 300_000
  assert.equal(await refresher.refresh(), true)
  assert.deepEqual(calls.at(-1), { since: '2026-10-26T10:00:00Z' }, 'later refreshes are incremental')
})

test('a 422 for a bad `since` forgets it, so the next pull is full', async () => {
  reset()
  store.set(`wns-learning-pulled:${USER}`, 'not-a-time')
  const api = { fetchProgress: async () => { throw Object.assign(new Error('Unprocessable'), { response: { status: 422 } }) } }
  assert.equal(await hydrateProgressFromServer(USER, api, { incremental: true }), false)
  assert.equal(store.has(`wns-learning-pulled:${USER}`), false)
})

test('500+ completed lessons merge in one request', async () => {
  reset()
  const many = lessons.slice(0, 600).map((lesson) => ({ key: lesson.id, status: 'completed', completed_percent: 100 }))
  let fetches = 0
  const api = { fetchProgress: async () => { fetches += 1; return { lessons: many, server_time: '2026-10-26T11:00:00Z', truncated: false } } }
  const started = performance.now()
  assert.equal(await hydrateProgressFromServer(USER, api), true)
  const elapsed = performance.now() - started
  assert.equal(fetches, 1)
  const ids = new Set(many.map((entry) => entry.key))
  assert.equal(Object.values(readLearningProgress(USER)).filter((entry) => entry.status === 'completed').length, ids.size)
  assert.ok(elapsed < 500, `merge took ${elapsed.toFixed(0)} ms`)
})

test('accounts stay separate', () => {
  reset()
  mergeServerProgress('a@example.com', [{ key: A, status: 'completed', completed_percent: 100 }])
  assert.deepEqual(readLearningProgress('b@example.com'), {})
})
