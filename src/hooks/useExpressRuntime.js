import { EXPRESS_PREFIX } from '../lib/codelab/storageKeys.js'
import { expressOpenApi, expressRunProblem, findExpressEntry, toExpressOutputResult, toNodeFiles } from '../lib/codelab/nodeProject.js'
import { useSpringRuntime } from './useSpringRuntime'

// An Express app runs like a Spring Boot project: on WebNest's server (POST /api/node/project/run),
// started for each Run or request, with earlier writes replayed first. This is also where a
// browser runtime (such as WebContainers) would plug in later, behind the same shape.
export const EXPRESS_RUNTIME = {
  endpoint: '/api/node/project/run',
  body: (project, requests) => ({ files: toNodeFiles(project), entry: findExpressEntry(project), requests }),
  runHint: 'Starting your Express app on the server… a first run can take up to a minute.',
  loginMessage: 'Log in to run Node.js projects.',
  unavailableMessage: 'The Node.js runner is unavailable right now. Please try again shortly.',
  replayNote: 'Reset data to start from an empty app again.',
  storagePrefix: EXPRESS_PREFIX,
  toOutputResult: toExpressOutputResult,
  runProblem: expressRunProblem,
  openapi: expressOpenApi,
}

export const useExpressRuntime = (workspaceKey, files) => useSpringRuntime(workspaceKey, files, EXPRESS_RUNTIME)
