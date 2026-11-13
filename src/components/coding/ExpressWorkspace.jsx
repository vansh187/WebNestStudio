import { useEffect, useState } from 'react'
import SpringWorkspace from './SpringWorkspace'
import { useExpressRuntime } from '../../hooks/useExpressRuntime'
import { nodePackages } from '../../lib/codelab/nodePackages'
import {
  languageForNodeFile, nodeFileTemplate, nodeProjectSize, normalizeNodePath, validateNodePath, NODE_MAX_BYTES,
} from '../../lib/codelab/nodeProject.js'
import { SPRING_MAX_WRITES } from '../../lib/codelab/springProject.js'

const code = 'font-mono text-xs'

// Routes, middleware, models and SQL get the same coloured dots as the FastAPI layers.
function expressLayer(name) {
  if (/^routes\//.test(name) || /routes?\.(?:c|m)?js$/.test(name)) return 'api'
  if (/^(?:services|controllers)\//.test(name)) return 'services'
  if (/^(?:models|db|data)\//.test(name)) return 'repositories'
  if (/\.sql$/.test(name)) return 'schema'
  return null
}

const EXPRESS_TREE_RULES = {
  normalize: normalizeNodePath,
  validate: validateNodePath,
  template: nodeFileTemplate,
  languageFor: languageForNodeFile,
  layerOf: expressLayer,
  size: nodeProjectSize,
  maxBytes: NODE_MAX_BYTES,
  newRoot: 'routes/',
  placeholder: 'routes/users.js',
  help: 'Use .js, .mjs, .cjs or .json files in any folder except node_modules. The app starts from server.js.',
}

// The preinstalled packages, loaded once when Help opens (cached by nodePackages.js).
function PackageList() {
  const [state, setState] = useState({ loading: true, packages: [], error: '' })
  useEffect(() => {
    let cancelled = false
    nodePackages()
      .then((list) => { if (!cancelled) setState({ loading: false, packages: list.packages, error: '' }) })
      .catch(() => { if (!cancelled) setState({ loading: false, packages: [], error: 'The package list could not be loaded right now.' }) })
    return () => { cancelled = true }
  }, [])
  if (state.loading) return <p className="text-xs text-ink-400">Loading the package list…</p>
  if (state.error) return <p className="text-xs text-ink-400">{state.error}</p>
  return (
    <ul className="flex flex-wrap gap-1">
      {state.packages.map((item) => (
        <li key={item.name} className="rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[11px] text-ink-600 dark:border-ink-700 dark:text-ink-300" title={`version ${item.version}`}>{item.name}</li>
      ))}
    </ul>
  )
}

function HelpText() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
      <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">How this workspace runs Express</h3>
      <p>Your Express app runs on WebNest&rsquo;s server with Node.js 24, not in your browser. Each <strong>Run</strong> or API request starts the app from <code className={code}>server.js</code>, sends the request, and stops the app again.</p>
      <p>So data kept in memory (or in <code className={code}>node:sqlite</code> with <code className={code}>:memory:</code>) starts empty each time. So that data you add stays, your successful POST, PUT, PATCH and DELETE requests are <strong>replayed</strong> before each new request (up to {SPRING_MAX_WRITES}). <strong>Reset data</strong> forgets them.</p>
      <p>Call <code className={code}>app.listen()</code> with any port, for example <code className={code}>app.listen(3000)</code>: the runner points it at the right one.</p>
      <h4 className="font-semibold text-ink-900 dark:text-white">The flow of a request</h4>
      <ol className="list-decimal space-y-1 pl-5">
        <li><strong>Middleware</strong> (<code className={code}>app.use(express.json())</code>): reads the JSON body into <code className={code}>req.body</code>.</li>
        <li><strong>Router</strong> (<code className={code}>routes/*.js</code>): matches the method and path, and reads <code className={code}>req.params</code> and <code className={code}>req.query</code>.</li>
        <li><strong>Handler</strong>: checks the input, changes the data, and answers with <code className={code}>res.status(201).json(...)</code>.</li>
        <li><strong>Error handler</strong> (<code className={code}>(err, req, res, next)</code>): turns a thrown error into a JSON answer.</li>
      </ol>
      <h4 className="font-semibold text-ink-900 dark:text-white">Packages</h4>
      <p><code className={code}>npm install</code> is not available: the server has no internet. These packages are already installed, so <code className={code}>require()</code> or <code className={code}>import</code> them directly:</p>
      <PackageList />
      <p>Limits per run: 15 seconds to start listening, 10 seconds per request, 256 MB of memory. The app can only read and write files in its own project. You need to be logged in, and there is a daily run limit.</p>
      <p><strong>WebNest AI</strong> (the AI tab) can read and change these files, run the app and send it requests. Each of its runs and requests counts toward your daily runs too.</p>
      <p className="text-xs text-ink-400">Coming later: saving Express projects to your account, and GitHub sync.</p>
    </div>
  )
}

const noMarkers = () => []

const EXPRESS_WORKSPACE = {
  useRuntime: useExpressRuntime,
  languageFor: languageForNodeFile,
  treeRules: EXPRESS_TREE_RULES,
  assistantLanguage: 'express',
  Help: HelpText,
  label: 'Express workspace',
  panelsLabel: 'Express panels',
  loginNote: 'Node.js projects run on WebNest’s server, so you need to be logged in.',
  footer: 'Express 5 · Node.js 24',
  runTitle: 'Start the app',
  markers: noMarkers,
  fileBadge: (name) => (name === 'package.json' ? 'Packages come preinstalled: see Help' : ''),
}

// The Express REST API workspace: the Spring Boot workspace's layout and run model, with
// Node.js files and the Express runner.
export default function ExpressWorkspace(props) {
  return <SpringWorkspace {...props} kit={EXPRESS_WORKSPACE} />
}
