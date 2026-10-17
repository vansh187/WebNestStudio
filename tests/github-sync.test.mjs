import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCommitChanges, changedFiles, emptyLink, filesForMode, gitBlobSha, guessMode, linkAfterCommit, linkFromSnapshot, planPull, pushRisks, resolvePull,
} from '../src/lib/github/sync.js'
import { ERROR_KIND, GitHubLocalError, GitHubResponseError, describeGitHubError } from '../src/lib/github/errors.js'

const httpError = (status, data = {}, headers = {}) => ({ response: { status, data, headers } })

// Reference values from `git hash-object`.
test('gitBlobSha matches git hash-object, including non-ASCII text', async () => {
  assert.equal(await gitBlobSha('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
  assert.equal(await gitBlobSha(''), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')
  assert.equal(await gitBlobSha('नमस्ते é 🚀\n'), '8a13169d21ce2c6c047775114c73c721714b8ba3')
})

async function snapshotOf(files, commit = 'c1') {
  return {
    owner: 'me', repo: 'proj', branch: 'main', commit_sha: commit, mode: 'backend', skipped: [],
    files: await Promise.all(Object.entries(files).map(async ([path, content]) => ({ path, language: 'plaintext', content, sha: await gitBlobSha(content) }))),
  }
}

test('filesForMode keeps what each editor mode can hold and explains the rest', async () => {
  const snap = await snapshotOf({
    'app/main.py': 'x', 'scripts/run.py': 'y', 'README.md': '#', 'src/main/java/demo/Main.java': 'class Main {}', 'index.html': '<p>', 'css/style.css': 'p{}', 'tests/Main.java': 'dup',
  })
  const backend = filesForMode(snap.files, 'backend')
  assert.deepEqual(backend.files.map((f) => f.name).sort(), ['README.md', 'app/main.py', 'css/style.css', 'index.html'])
  assert.ok(backend.skipped.some((s) => s.path === 'src/main/java/demo/Main.java'))
  assert.ok(backend.skipped.some((s) => s.path === 'scripts/run.py' && s.reason === 'not_supported'))

  const java = filesForMode(snap.files, 'java')
  assert.deepEqual(java.files.map((f) => f.name), ['Main.java'])
  assert.equal(java.paths['Main.java'], 'src/main/java/demo/Main.java')
  assert.equal(java.files[0].language, 'java')
  assert.ok(java.skipped.some((s) => s.path === 'tests/Main.java' && s.reason === 'duplicate'))

  const web = filesForMode(snap.files, 'web')
  assert.deepEqual(web.files.map((f) => f.name).sort(), ['index.html', 'style.css'])
  assert.equal(web.paths['style.css'], 'css/style.css')
})

test('guessMode picks backend, java, web, python in that order', () => {
  assert.equal(guessMode([{ path: 'app/main.py' }, { path: 'A.java' }]), 'backend')
  assert.equal(guessMode([{ path: 'src/A.java' }, { path: 'index.html' }]), 'java')
  assert.equal(guessMode([{ path: 'site/index.html' }]), 'web')
  assert.equal(guessMode([{ path: 'main.py' }]), 'python')
  assert.equal(guessMode([]), 'web')
})

test('push: changed, new and deleted files become commit changes with repo paths', async () => {
  const snap = await snapshotOf({ 'src/A.java': 'a', 'src/B.java': 'b', 'src/C.java': 'c' })
  const selection = filesForMode(snap.files, 'java')
  const link = linkFromSnapshot(snap, selection)
  const files = [
    { name: 'A.java', content: 'a' }, // unchanged
    { name: 'B.java', content: 'b2' }, // edited
    { name: 'D.java', content: 'd' }, // new
  ] // C.java deleted
  assert.deepEqual(await changedFiles(files, link), { upserts: ['B.java', 'D.java'], deletes: ['C.java'] })
  const changes = await buildCommitChanges(files, link)
  assert.deepEqual(changes, [
    { path: 'src/B.java', action: 'upsert', content: 'b2' },
    { path: 'D.java', action: 'upsert', content: 'd' },
    { path: 'src/C.java', action: 'delete' },
  ])

  // The response may omit a file; its SHA then comes from the local content.
  const next = await linkAfterCommit(link, files, changes, { commit_sha: 'c2', files: [{ path: 'src/B.java', sha: await gitBlobSha('b2') }] })
  assert.equal(next.commit_sha, 'c2')
  assert.equal(next.shas['D.java'], await gitBlobSha('d'))
  assert.equal(next.paths['D.java'], 'D.java')
  assert.ok(!('C.java' in next.shas))
  assert.deepEqual(await changedFiles(files, next), { upserts: [], deletes: [] })
})

test('first push to an empty repo sends every file', async () => {
  const link = emptyLink({ owner: 'me', repo: 'new', branch: 'main', commitSha: 'c0', htmlUrl: 'https://github.com/me/new' })
  const changes = await buildCommitChanges([{ name: 'app/main.py', content: 'x' }], link)
  assert.deepEqual(changes, [{ path: 'app/main.py', action: 'upsert', content: 'x' }])
})

test('pull: up to date, remote-only, local-only, added and deleted files', async () => {
  const base = await snapshotOf({ 'app/main.py': 'm1', 'app/a.py': 'a1', 'app/b.py': 'b1', 'app/gone.py': 'g1' })
  const link = linkFromSnapshot(base, filesForMode(base.files, 'backend'))
  const local = [
    { name: 'app/main.py', content: 'm1' },
    { name: 'app/a.py', content: 'a-local' }, // changed only here
    { name: 'app/b.py', content: 'b1' },
    { name: 'app/gone.py', content: 'g1' },
  ]

  const same = await planPull(base, link, local, 'backend')
  assert.equal(same.apply.length + same.remove.length + same.conflicts.length, 0)

  const remote = await snapshotOf({ 'app/main.py': 'm1', 'app/a.py': 'a1', 'app/b.py': 'b-remote', 'app/new.py': 'n' }, 'c2')
  const plan = await planPull(remote, link, local, 'backend')
  assert.deepEqual(plan.apply.map((f) => f.name).sort(), ['app/b.py', 'app/new.py'])
  assert.deepEqual(plan.remove, ['app/gone.py'])
  assert.equal(plan.conflicts.length, 0)

  const { files, link: next } = resolvePull(plan, local, link, 'mine')
  const byName = Object.fromEntries(files.map((f) => [f.name, f.content]))
  assert.deepEqual(byName, { 'app/main.py': 'm1', 'app/a.py': 'a-local', 'app/b.py': 'b-remote', 'app/new.py': 'n' })
  assert.equal(next.commit_sha, 'c2')
  // Only the local-only edit is left to push.
  assert.deepEqual(await changedFiles(files, next), { upserts: ['app/a.py'], deletes: [] })
})

test('pull conflicts: keep mine or take GitHub version', async () => {
  const base = await snapshotOf({ 'app/main.py': 'm1', 'app/x.py': 'x1', 'app/y.py': 'y1' })
  const link = linkFromSnapshot(base, filesForMode(base.files, 'backend'))
  const local = [
    { name: 'app/main.py', content: 'm-local' }, // both changed
    { name: 'app/y.py', content: 'y-local' }, // changed here, deleted there
  ] // x.py deleted here, changed there
  const remote = await snapshotOf({ 'app/main.py': 'm-remote', 'app/x.py': 'x-remote' }, 'c2')
  const plan = await planPull(remote, link, local, 'backend')
  assert.deepEqual(plan.conflicts.map((c) => [c.name, c.kind]).sort(), [
    ['app/main.py', 'both_changed'], ['app/x.py', 'deleted_here'], ['app/y.py', 'deleted_there'],
  ])

  const mine = resolvePull(plan, local, link, 'mine')
  assert.deepEqual(Object.fromEntries(mine.files.map((f) => [f.name, f.content])), { 'app/main.py': 'm-local', 'app/y.py': 'y-local' })
  // Kept versions differ from GitHub, so they show as changes to push.
  const pending = await changedFiles(mine.files, mine.link)
  assert.deepEqual(pending.upserts.sort(), ['app/main.py', 'app/y.py'])
  assert.deepEqual(pending.deletes, ['app/x.py'])

  const theirs = resolvePull(plan, local, link, 'theirs')
  assert.deepEqual(Object.fromEntries(theirs.files.map((f) => [f.name, f.content])), { 'app/main.py': 'm-remote', 'app/x.py': 'x-remote' })
  assert.deepEqual(await changedFiles(theirs.files, theirs.link), { upserts: [], deletes: [] })
})

// A web project imported from a repo with folders: css/style.css shows as style.css.
async function webProject() {
  const base = await snapshotOf({ 'index.html': '<h1>a</h1>', 'css/style.css': 'body{}', 'js/app.js': 'x' })
  const selection = filesForMode(base.files, 'web')
  return { link: linkFromSnapshot(base, selection), local: selection.files.map((file) => ({ ...file })) }
}
const edit = (files, name, content) => files.map((file) => (file.name === name ? { ...file, content } : file))

test('pull never deletes a file GitHub still has but the snapshot left out', async () => {
  const { link, local } = await webProject()
  const tooLarge = { ...(await snapshotOf({ 'index.html': '<h1>a</h1>', 'js/app.js': 'x' }, 'c2')), skipped: [{ path: 'css/style.css', reason: 'too_large' }] }
  const plan = await planPull(tooLarge, link, local, 'web')
  assert.deepEqual(plan.remove, [])
  assert.deepEqual(plan.unavailable, ['style.css'])
  const { files, link: next } = resolvePull(plan, local, link, 'theirs')
  assert.ok(files.some((file) => file.name === 'style.css'))
  assert.equal(next.paths['style.css'], 'css/style.css')
  assert.equal(next.shas['style.css'], link.shas['style.css'])

  // Over the file limit, any path missing from the snapshot may still exist.
  const truncated = { ...(await snapshotOf({ 'index.html': '<h1>a</h1>' }, 'c2')), skipped: [{ path: 'x.js', reason: 'limit' }] }
  const limited = await planPull(truncated, link, local, 'web')
  assert.deepEqual(limited.remove, [])
  assert.equal(limited.unavailable.length, 2)
})

test('keep mine after a GitHub delete pushes back to the original repo path', async () => {
  const { link, local } = await webProject()
  const remote = await snapshotOf({ 'index.html': '<h1>a</h1>', 'js/app.js': 'x' }, 'c3')
  const edited = edit(local, 'style.css', 'body{color:red}')
  const plan = await planPull(remote, link, edited, 'web')
  assert.equal(plan.conflicts[0].kind, 'deleted_there')
  const kept = resolvePull(plan, edited, link, 'mine')
  const changes = await buildCommitChanges(kept.files, kept.link)
  assert.deepEqual(changes.map((change) => [change.path, change.action]), [['css/style.css', 'upsert']])
  // Pulling again before the push is not a new conflict and keeps the path.
  const again = await planPull(remote, kept.link, kept.files, 'web')
  assert.deepEqual(again.conflicts, [])
  assert.equal(resolvePull(again, kept.files, kept.link).link.paths['style.css'], 'css/style.css')
  // After the push the file is tracked normally.
  const pushed = await linkAfterCommit(kept.link, kept.files, changes, { commit_sha: 'c4', files: [] })
  assert.equal(pushed.paths['style.css'], 'css/style.css')
  assert.deepEqual(await buildCommitChanges(kept.files, pushed), [])
})

test('pull matches tracked files by repo path, not by editor name', async () => {
  const { link, local } = await webProject()
  // a/style.css sorts before css/style.css and has the same editor name.
  const remote = await snapshotOf({ 'index.html': '<h1>b</h1>', 'css/style.css': 'body{}', 'a/style.css': 'other', 'js/app.js': 'x', 'js/new.js': 'n' }, 'c5')
  const plan = await planPull(remote, link, local, 'web')
  assert.deepEqual(plan.apply.map((file) => file.name).sort(), ['index.html', 'new.js'])
  const { files, link: next } = resolvePull(plan, local, link)
  assert.equal(next.paths['style.css'], 'css/style.css')
  assert.equal(files.find((file) => file.name === 'style.css').content, 'body{}')
  assert.equal(next.paths['new.js'], 'js/new.js')
})

test('web, Python and Java imports stop at 2 MB', async () => {
  const big = 'x'.repeat(1200 * 1024)
  const selection = filesForMode((await snapshotOf({ 'a.js': big, 'b.js': big })).files, 'web')
  assert.equal(selection.files.length, 1)
  assert.equal(selection.skipped[0].reason, 'limit')
})

test('push asks before overwriting a file the last pull could not read', async () => {
  const { link, local } = await webProject()
  const remote = { ...(await snapshotOf({ 'index.html': '<h1>a</h1>', 'js/app.js': 'x' }, 'c2')), skipped: [{ path: 'css/style.css', reason: 'too_large' }] }
  const edited = edit(local, 'style.css', 'body{color:red}')
  const pulled = resolvePull(await planPull(remote, link, edited, 'web'), edited, link)
  assert.deepEqual(pulled.link.unverified, ['style.css'])
  const changes = await buildCommitChanges(pulled.files, pulled.link)
  assert.deepEqual(pushRisks(pulled.link, changes), ['css/style.css'])
  const pushed = await linkAfterCommit(pulled.link, pulled.files, changes, { commit_sha: 'c3', files: [] })
  assert.deepEqual(pushed.unverified, [])
  // Not edited here: nothing to push, nothing to ask.
  const untouched = resolvePull(await planPull(remote, link, local, 'web'), local, link)
  assert.deepEqual(pushRisks(untouched.link, await buildCommitChanges(untouched.files, untouched.link)), [])
})

test('files added on GitHub are limited by the whole project after the pull', async () => {
  const many = Object.fromEntries(Array.from({ length: 39 }, (_, i) => [`f${String(i).padStart(2, '0')}.js`, `// ${i}`]))
  const base = await snapshotOf(many)
  const selection = filesForMode(base.files, 'web')
  const link = linkFromSnapshot(base, selection)
  const plan = await planPull(await snapshotOf({ ...many, 'n1.js': 'a', 'n2.js': 'b', 'n3.js': 'c' }, 'c2'), link, selection.files, 'web')
  assert.equal(plan.apply.length, 1)
  assert.equal(plan.limited.length, 2)

  const bigPy = '#'.repeat(150 * 1024)
  const backendBase = await snapshotOf({ 'app/main.py': bigPy })
  const backendSelection = filesForMode(backendBase.files, 'backend')
  const backendLink = linkFromSnapshot(backendBase, backendSelection)
  const backendPlan = await planPull(await snapshotOf({ 'app/main.py': bigPy, 'app/other.py': '#'.repeat(80 * 1024), 'app/small.py': 'x = 1' }, 'c2'), backendLink, backendSelection.files, 'backend')
  assert.deepEqual(backendPlan.apply.map((file) => file.name), ['app/small.py'])
  assert.deepEqual(backendPlan.limited.map((item) => item.path), ['app/other.py'])
})

test('errors: every contract code maps to an action', () => {
  const cases = [
    [400, 'invalid_state', ERROR_KIND.INVALID_STATE],
    [400, 'oauth_exchange_failed', ERROR_KIND.OAUTH_FAILED],
    [404, 'repo_not_found', ERROR_KIND.NOT_FOUND],
    [409, 'github_not_connected', ERROR_KIND.CONNECT],
    [409, 'github_reauth_required', ERROR_KIND.CONNECT],
    [409, 'non_fast_forward', ERROR_KIND.STALE],
    [413, 'payload_too_large', ERROR_KIND.TOO_LARGE],
    [429, 'github_rate_limited', ERROR_KIND.RATE_LIMITED],
    [502, 'github_unavailable', ERROR_KIND.UNAVAILABLE],
  ]
  for (const [status, code, kind] of cases) {
    const info = describeGitHubError(httpError(status, { detail: `msg ${code}`, code }))
    assert.equal(info.kind, kind, code)
    assert.equal(info.code, code)
  }
  const stale = describeGitHubError(httpError(409, { detail: 'newer', code: 'non_fast_forward', remote_commit_sha: 'abc' }))
  assert.equal(stale.remoteCommitSha, 'abc')
  const limited = describeGitHubError(httpError(429, { detail: 'slow down', code: 'github_rate_limited', retry_after: 42 }))
  assert.equal(limited.retryAfter, 42)
  assert.match(limited.message, /42 s/)
})

test('errors: statuses without a code, network failures and bad bodies', () => {
  assert.equal(describeGitHubError(httpError(401, { detail: 'Not authenticated' })).kind, ERROR_KIND.LOGIN)
  assert.equal(describeGitHubError(httpError(404, { detail: 'Not Found' })).kind, ERROR_KIND.NOT_DEPLOYED)
  assert.equal(describeGitHubError(httpError(405, {})).kind, ERROR_KIND.NOT_DEPLOYED)
  assert.equal(describeGitHubError(httpError(500, 'Internal Server Error')).kind, ERROR_KIND.UNAVAILABLE)
  assert.equal(describeGitHubError(httpError(503, {})).kind, ERROR_KIND.UNAVAILABLE)
  assert.equal(describeGitHubError(httpError(418, {})).kind, ERROR_KIND.UNKNOWN)

  const validation = describeGitHubError(httpError(422, { errors: [{ loc: ['body', 'name'], msg: 'Taken.' }] }))
  assert.equal(validation.kind, ERROR_KIND.VALIDATION)
  assert.deepEqual(validation.fields, [{ field: 'name', message: 'Taken.' }])
  assert.equal(validation.message, 'Taken.')

  assert.equal(describeGitHubError({ code: 'ECONNABORTED', message: 'timeout of 60000ms exceeded', request: {} }).kind, ERROR_KIND.TIMEOUT)
  assert.equal(describeGitHubError({ code: 'ERR_NETWORK', message: 'Network Error', request: {} }).kind, ERROR_KIND.NETWORK)
  assert.equal(describeGitHubError(new GitHubResponseError('bad')).kind, ERROR_KIND.BAD_RESPONSE)
  assert.equal(describeGitHubError(new GitHubLocalError('Needs https.')).message, 'Needs https.')
  assert.equal(describeGitHubError(undefined).kind, ERROR_KIND.UNKNOWN)
  assert.equal(describeGitHubError(httpError(429, {}, { 'retry-after': '7' })).retryAfter, 7)
})
