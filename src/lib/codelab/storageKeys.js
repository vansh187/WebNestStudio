// localStorage key prefixes for what CodeLab keeps in this browser. One place, so the
// account wipe (accountData.js) and project deletion always clear what the pages write.

// The playground's session copies (pages/coding/Playground.jsx, SharedSnippet.jsx).
export const PLAYGROUND_KEY = 'wns-codelab-playground'
// Per workspace: debugger breakpoints (BackendWorkspace.jsx).
export const BREAKPOINTS_PREFIX = 'wns-codelab-breakpoints:'
// Per workspace: the API tester's Bearer token and history (useApiTesterSession.js).
export const API_TESTER_PREFIX = 'wns-codelab-api:'
// Per workspace: a saved project's .env (envStore.js).
export const ENV_STORAGE_PREFIX = 'wns-codelab-env:'

export const WORKSPACE_PREFIXES = [BREAKPOINTS_PREFIX, API_TESTER_PREFIX, ENV_STORAGE_PREFIX]

// The workspace key of a saved backend project (pages/coding/ProjectWorkspace.jsx).
export const projectWorkspaceKey = (projectId) => `project:${projectId}`

// A new playground workspace's database id (Playground.jsx, SharedSnippet.jsx): part of the
// workspace key, so the database, API tester token and breakpoints start empty.
export const newDbId = () => Math.random().toString(36).slice(2, 10)

// IndexedDB key of a workspace's SQLite database (dbStore.js, useApiRuntime.js).
export const DB_STORAGE_PREFIX = 'wns-codelab-db:'
export const databaseKey = (workspaceKey) => `${DB_STORAGE_PREFIX}${workspaceKey}`
