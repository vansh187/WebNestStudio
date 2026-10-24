// Pure GitHub sync logic for the playground: no React, no network. A project is linked to
// a repo by `link`:
//   { owner, repo, branch, commit_sha, html_url, paths: { [localName]: repoPath }, shas: { [localName]: blobSha },
//     unverified?: [localName] }
// `shas` holds each file's git blob SHA as of the last import/push/pull, so comparing it
// with the SHA of the current content tells exactly what changed on each side. A name in
// `paths` without a SHA is a local file not on GitHub yet that must go to that path.
// `unverified` lists files the last pull could not read from GitHub (too large, over a
// limit), whose GitHub version may be newer than their SHA says.
import { MAX_BACKEND_BYTES, MAX_BACKEND_FILES, isPrivateFile, languageForFile, validateBackendPath } from '../codelab/backendFiles.js'
import { GitHubLocalError } from './errors.js'

export const MODES = ['backend', 'web', 'python', 'java']
export const MAX_PROJECT_FILES = MAX_BACKEND_FILES
// Web, Python and Java imports: the backend's own snapshot and commit limit. Projects are
// saved in IndexedDB (lib/codelab/projectStore.js), which has room for this.
export const MAX_PROJECT_BYTES = 2 * 1024 * 1024

const encoder = new TextEncoder()

// Recent content -> SHA, so the changed-files badge only hashes the file that was edited.
const shaCache = new Map()
const SHA_CACHE_SIZE = 400

// Same value as `git hash-object`: sha1 of "blob <byte length>\0" followed by the bytes.
export async function gitBlobSha(text) {
  const content = String(text ?? '')
  const cached = shaCache.get(content)
  if (cached) return cached
  // crypto.subtle only exists on secure pages (https or localhost).
  if (!globalThis.crypto?.subtle) throw new GitHubLocalError('GitHub sync needs a secure page. Open CodeLab over https.')
  const body = encoder.encode(content)
  const header = encoder.encode(`blob ${body.length}\0`)
  const bytes = new Uint8Array(header.length + body.length)
  bytes.set(header)
  bytes.set(body, header.length)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  const sha = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  if (shaCache.size >= SHA_CACHE_SIZE) shaCache.delete(shaCache.keys().next().value)
  shaCache.set(content, sha)
  return sha
}

const extensionOf = (path) => /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase() ?? ''
const baseName = (path) => path.split('/').pop()

const MODE_EXTENSIONS = {
  web: new Set(['html', 'css', 'js']),
  python: new Set(['py']),
  java: new Set(['java']),
}

// Picks the files an editor mode can hold. Returns { files, paths, skipped } where files
// are editor files ({ name, language, content }), paths maps editor name -> repo path, and
// skipped explains every repo file that was left out.
export function filesForMode(repoFiles = [], mode) {
  const files = []
  const paths = {}
  const skipped = []
  let bytes = 0
  const sorted = [...repoFiles].sort((a, b) => a.path.localeCompare(b.path))
  for (const file of sorted) {
    const size = encoder.encode(file.content).length
    if (mode === 'backend') {
      if (isPrivateFile(file.path)) {
        skipped.push({ path: file.path, reason: 'private', message: 'Secrets stay out of sync: create your own .env in the editor.' })
        continue
      }
      const problem = validateBackendPath(file.path, files)
      if (problem) {
        skipped.push({ path: file.path, reason: 'not_supported', message: problem })
        continue
      }
      if (bytes + size > MAX_BACKEND_BYTES) {
        skipped.push({ path: file.path, reason: 'limit', message: `The project would exceed ${Math.round(MAX_BACKEND_BYTES / 1024)} KB.` })
        continue
      }
      files.push({ name: file.path, language: languageForFile(file.path), content: file.content })
      paths[file.path] = file.path
      bytes += size
      continue
    }
    const allowed = MODE_EXTENSIONS[mode]
    if (!allowed?.has(extensionOf(file.path))) {
      skipped.push({ path: file.path, reason: 'not_supported', message: `Not used in ${mode} projects.` })
      continue
    }
    // Java and web projects keep flat file names, as the editor expects.
    const name = mode === 'python' ? file.path : baseName(file.path)
    if (files.some((item) => item.name === name)) {
      skipped.push({ path: file.path, reason: 'duplicate', message: `Another file is already named ${name}.` })
      continue
    }
    if (files.length >= MAX_PROJECT_FILES) {
      skipped.push({ path: file.path, reason: 'limit', message: `A project can hold up to ${MAX_PROJECT_FILES} files.` })
      continue
    }
    if (bytes + size > MAX_PROJECT_BYTES) {
      skipped.push({ path: file.path, reason: 'limit', message: `The project would exceed ${Math.round(MAX_PROJECT_BYTES / 1024)} KB.` })
      continue
    }
    files.push({ name, language: mode === 'java' ? 'java' : languageForFile(name), content: file.content })
    paths[name] = file.path
    bytes += size
  }
  return { files, paths, skipped }
}

// The link for a project that was just imported from a snapshot.
export function linkFromSnapshot(snapshot, selection, htmlUrl) {
  const shaByPath = Object.fromEntries(snapshot.files.map((file) => [file.path, file.sha]))
  const shas = {}
  for (const [name, path] of Object.entries(selection.paths)) shas[name] = shaByPath[path]
  return {
    owner: snapshot.owner,
    repo: snapshot.repo,
    branch: snapshot.branch,
    commit_sha: snapshot.commit_sha,
    html_url: htmlUrl ?? `https://github.com/${snapshot.owner}/${snapshot.repo}`,
    paths: { ...selection.paths },
    shas,
  }
}

// A fresh link for a repo that has no project files yet (just created, or first push).
export function emptyLink({ owner, repo, branch, commitSha, htmlUrl }) {
  return { owner, repo, branch, commit_sha: commitSha, html_url: htmlUrl, paths: {}, shas: {} }
}

export function isValidLink(link) {
  return Boolean(link && typeof link === 'object' && link.owner && link.repo && link.branch && link.commit_sha
    && link.paths && typeof link.paths === 'object' && link.shas && typeof link.shas === 'object')
}

// Files changed since the last sync: { upserts: [names], deletes: [names] }. The .env file
// holds the learner's keys, so it is never pushed (and so never counts as a change).
export async function changedFiles(allFiles = [], link) {
  const files = allFiles.filter((file) => !isPrivateFile(file.name))
  if (!isValidLink(link)) return { upserts: files.map((file) => file.name), deletes: [] }
  const upserts = []
  for (const file of files) {
    const known = link.shas[file.name]
    if (!known || known !== await gitBlobSha(file.content)) upserts.push(file.name)
  }
  const present = new Set(files.map((file) => file.name))
  const deletes = Object.keys(link.shas).filter((name) => !present.has(name))
  return { upserts, deletes }
}

const repoPathOf = (link, name) => link.paths?.[name] ?? name

// The `changes` array for POST .../commits.
export async function buildCommitChanges(files = [], link) {
  const { upserts, deletes } = await changedFiles(files, link)
  const byName = new Map(files.map((file) => [file.name, file]))
  return [
    ...upserts.map((name) => ({ path: repoPathOf(link, name), action: 'upsert', content: byName.get(name).content })),
    ...deletes.map((name) => ({ path: repoPathOf(link, name), action: 'delete' })),
  ]
}

// The link after a successful commit. Falls back to the local SHA when the response
// leaves a file out, so a partial `files` list never marks a pushed file as changed.
export async function linkAfterCommit(link, files, changes, result) {
  const shaByPath = Object.fromEntries((result.files ?? []).map((file) => [file.path, file.sha]))
  const byPath = new Map()
  for (const file of files) byPath.set(repoPathOf(link, file.name), file)
  const paths = { ...link.paths }
  const shas = { ...link.shas }
  const tracked = [...new Set([...Object.keys(paths), ...Object.keys(shas)])]
  const pushed = new Set()
  for (const change of changes) {
    const known = tracked.find((name) => repoPathOf(link, name) === change.path)
    const name = known ?? byPath.get(change.path)?.name ?? change.path
    pushed.add(name)
    if (change.action === 'delete') {
      delete paths[name]
      delete shas[name]
    } else {
      paths[name] = change.path
      shas[name] = shaByPath[change.path] ?? await gitBlobSha(change.content)
    }
  }
  // A pushed file is now GitHub's version, so it no longer needs checking.
  const unverified = (link.unverified ?? []).filter((name) => !pushed.has(name))
  return { ...link, commit_sha: result.commit_sha, paths, shas, unverified }
}

const editorFile = (name, content, mode, current) => ({
  ...current,
  name,
  language: current?.language ?? (mode === 'java' ? 'java' : languageForFile(name)),
  content,
})

// Plans a pull. Files the link tracks are matched to GitHub by repo path; new GitHub files
// are picked with filesForMode. Each editor file ends up in one of:
//   apply       - take GitHub's version (changed only on GitHub, or new there)
//   remove      - deleted on GitHub and unchanged here
//   conflicts   - changed on both sides; resolvePull decides with 'mine' or 'theirs'
//   unavailable - still on GitHub but not in the snapshot (too large, over a limit,
//                 unreadable); left exactly as it is
// Files changed only here are kept as they are. `synced` is the link entry
// ({ path, sha }) each file gets whatever the conflict choice is.
export async function planPull(snapshot, link, files = [], mode) {
  const remoteByPath = new Map(snapshot.files.map((file) => [file.path, file]))
  const skippedPaths = new Set(snapshot.skipped.map((item) => item.path))
  // With a file limit hit, a path missing from the snapshot may still exist on GitHub.
  const complete = !snapshot.skipped.some((item) => item.reason === 'limit')
  const local = new Map(files.map((file) => [file.name, file]))
  const apply = []
  const remove = []
  const conflicts = []
  const unavailable = []
  const synced = {}

  const trackedNames = [...new Set([...Object.keys(link.paths), ...Object.keys(link.shas)])]
  const trackedPaths = new Set()
  for (const name of trackedNames) {
    const path = repoPathOf(link, name)
    trackedPaths.add(path)
    const base = link.shas[name]
    const mine = local.get(name)
    const remoteFile = remoteByPath.get(path)

    if (!remoteFile) {
      if (!base) {
        // Kept locally after GitHub deleted it, not pushed yet: still only ours.
        if (mine) synced[name] = { path, sha: null }
        continue
      }
      if (skippedPaths.has(path) || !complete) {
        unavailable.push(name)
        synced[name] = { path, sha: base }
        continue
      }
      if (!mine) continue // deleted on both sides
      if (await gitBlobSha(mine.content) === base) remove.push(name)
      else conflicts.push({ name, kind: 'deleted_there', theirs: null, path, sha: null })
      continue
    }

    const theirs = remoteFile.sha
    const file = editorFile(name, remoteFile.content, mode, mine)
    if (!mine) {
      if (!base) {
        apply.push(file)
        synced[name] = { path, sha: theirs }
      } else if (base === theirs) synced[name] = { path, sha: theirs } // still deleted here
      else conflicts.push({ name, kind: 'deleted_here', theirs: file, path, sha: theirs })
      continue
    }
    const mineSha = await gitBlobSha(mine.content)
    if (mineSha === theirs || theirs === base) {
      synced[name] = { path, sha: theirs }
      continue
    }
    if (mineSha === base) {
      apply.push(file)
      synced[name] = { path, sha: theirs }
    } else conflicts.push({ name, kind: 'both_changed', theirs: file, path, sha: theirs })
  }

  // Files added on GitHub since the last sync. They are checked against the limits of the
  // whole project after the pull, not only against each other.
  const projected = new Map(local)
  for (const file of apply) projected.set(file.name, file)
  for (const name of remove) projected.delete(name)
  let bytes = 0
  for (const file of projected.values()) bytes += encoder.encode(file.content ?? '').length
  const maxBytes = mode === 'backend' ? MAX_BACKEND_BYTES : MAX_PROJECT_BYTES
  const limited = []

  const taken = new Set(trackedNames)
  const added = filesForMode(snapshot.files.filter((file) => !trackedPaths.has(file.path)), mode)
  for (const file of added.files) {
    if (taken.has(file.name)) continue
    const path = added.paths[file.name]
    const theirs = remoteByPath.get(path).sha
    const mine = local.get(file.name)
    if (!mine) {
      const size = encoder.encode(file.content).length
      const problem = mode === 'backend'
        ? validateBackendPath(file.name, [...projected.values()])
        : projected.size >= MAX_PROJECT_FILES ? `A project can hold up to ${MAX_PROJECT_FILES} files.` : ''
      if (problem || bytes + size > maxBytes) {
        limited.push({ path, message: problem || `The project would exceed ${Math.round(maxBytes / 1024)} KB.` })
        continue
      }
      apply.push(file)
      projected.set(file.name, file)
      bytes += size
      synced[file.name] = { path, sha: theirs }
    } else if (await gitBlobSha(mine.content) === theirs) synced[file.name] = { path, sha: theirs }
    else conflicts.push({ name: file.name, kind: 'both_changed', theirs: file, path, sha: theirs })
  }

  return { snapshot, apply, remove, conflicts, unavailable, limited, synced }
}

// Applies a pull plan. `choice` ('mine' | 'theirs') settles every conflict.
// Returns { files, link }. The new base is GitHub's state, so files kept as 'mine'
// show up as local changes and go to GitHub (at their original path) on the next push.
export function resolvePull(plan, files = [], link, choice = 'mine') {
  const takeTheirs = choice === 'theirs'
  const next = new Map(files.map((file) => [file.name, file]))
  for (const file of plan.apply) next.set(file.name, file)
  for (const name of plan.remove) next.delete(name)

  const paths = {}
  const shas = {}
  for (const [name, entry] of Object.entries(plan.synced)) {
    paths[name] = entry.path
    if (entry.sha) shas[name] = entry.sha
  }
  for (const conflict of plan.conflicts) {
    if (takeTheirs) {
      if (conflict.theirs) next.set(conflict.name, conflict.theirs)
      else next.delete(conflict.name)
    }
    if (conflict.sha) {
      paths[conflict.name] = conflict.path
      shas[conflict.name] = conflict.sha
    } else if (!takeTheirs) {
      // Kept after GitHub deleted it: no base SHA, so the next push re-creates it there.
      paths[conflict.name] = conflict.path
    }
  }
  // Files the pull could not compare with GitHub; a push of them asks first (pushRisks).
  const unverified = plan.unavailable.filter((name) => next.has(name) || shas[name])
  return {
    files: [...next.values()],
    link: { ...link, commit_sha: plan.snapshot.commit_sha, branch: plan.snapshot.branch, paths, shas, unverified },
  }
}

// Repo paths in `changes` that would overwrite or delete a file the last pull could not
// read, so a change made to it on GitHub would be lost without a conflict.
export function pushRisks(link, changes) {
  const unverified = new Set((link.unverified ?? []).map((name) => repoPathOf(link, name)))
  return changes.filter((change) => unverified.has(change.path)).map((change) => change.path)
}

// The editor mode for a snapshot when the backend did not send a usable one.
export function guessMode(repoFiles = []) {
  const paths = repoFiles.map((file) => file.path)
  if (paths.includes('app/main.py')) return 'backend'
  if (paths.some((path) => path.endsWith('.java'))) return 'java'
  if (paths.some((path) => baseName(path) === 'index.html')) return 'web'
  if (paths.some((path) => path.endsWith('.py'))) return 'python'
  return 'web'
}
