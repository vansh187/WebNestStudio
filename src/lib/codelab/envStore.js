// A saved project's .env, kept in this browser only. The server copy never has it
// (toCodePayload in api/coding.js drops private files), so the project page keeps it
// here per workspace and puts it back after loading. Cleared on logout (accountData.js),
// which asks first while any is saved. Reads and writes follow the gateway's rules (idb.js).
import { ENV_FILE, languageForFile } from './backendFiles.js'
import { codelabLocal } from './idb.js'
import { ENV_STORAGE_PREFIX } from './storageKeys.js'

const storageKey = (workspaceKey) => `${ENV_STORAGE_PREFIX}${workspaceKey}`

// The workspace's saved .env as a file, or null.
export function loadEnvFile(workspaceKey) {
  const content = codelabLocal.get(storageKey(workspaceKey))
  return content == null ? null : { name: ENV_FILE, language: languageForFile(ENV_FILE), content }
}

// Saves the workspace's .env text, or forgets it when `content` is null (no .env).
export function saveEnvContent(workspaceKey, content) {
  if (content != null) codelabLocal.set(storageKey(workspaceKey), content)
  else codelabLocal.remove(storageKey(workspaceKey))
}

// Saves the .env among `files` for the workspace, or forgets it when there is none.
export function saveEnvFile(workspaceKey, files = []) {
  saveEnvContent(workspaceKey, files.find((file) => file?.name === ENV_FILE)?.content ?? null)
}

// Adds the workspace's saved .env to files loaded from the server (which never have one).
export function withSavedEnv(workspaceKey, files) {
  const env = loadEnvFile(workspaceKey)
  if (!env || !Array.isArray(files) || files.some((file) => file.name === ENV_FILE)) return files
  return [...files, env]
}
