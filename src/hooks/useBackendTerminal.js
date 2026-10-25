import { useCallback, useEffect, useRef, useState } from 'react'
import { languageForFile, validateBackendPath } from '../lib/codelab/backendFiles'
import {
  MAX_SCRIPT_DEPTH, PACKAGE_FILE, REQUIREMENTS_FILE, addRequirements, installHint, listFolder, normalizeName, parseRequirements,
  removeRequirements, resolveCommand, splitCommand,
} from '../lib/codelab/terminal'
import { createRelayMatcher, relayStatusText } from '../lib/codelab/relay'

const ENTRY_LIMIT = 100
const HISTORY_LIMIT = 50
const NOTICE_GRACE_MS = 1000

const fresh = (key) => ({ key, entries: [], history: [], busy: false, clearedResult: null })

// The backend terminal: runs typed commands (see lib/codelab/terminal.js) against the
// browser runtime. It lives in the workspace, not the Output tab, so a command keeps
// running and keeps its output while another tab is open.
export function useBackendTerminal({ api, files, onFilesChange, onRun, onClearRequests, workspaceKey }) {
  const [state, setState] = useState(() => fresh(workspaceKey))
  let terminal = state
  if (state.key !== workspaceKey) {
    terminal = fresh(workspaceKey)
    setState(terminal)
  }

  // Commands are async: they read the latest files and runtime, not the ones they started with.
  const latest = useRef({})
  latest.current = { api, files, onFilesChange, onRun, onClearRequests }
  const nextId = useRef(0)

  const update = useCallback((key, change) => setState((current) => (current.key === key ? { ...current, ...change(current) } : current)), [])

  const execute = useCallback(async (line) => {
    const command = String(line ?? '').trim()
    const key = workspaceKey
    if (!command) return
    const id = (nextId.current += 1)
    update(key, (current) => ({
      busy: true,
      history: current.history[current.history.length - 1] === command ? current.history : [...current.history, command].slice(-HISTORY_LIMIT),
      entries: [...current.entries, { id, command, lines: [], status: 'running', startedAt: Date.now(), endedAt: null }].slice(-ENTRY_LIMIT),
    }))
    const print = (text, tone = 'out') => {
      if (!text) return
      update(key, (current) => ({ entries: current.entries.map((entry) => (entry.id === id ? { ...entry, lines: [...entry.lines, { text: String(text), tone }] } : entry)) }))
    }

    const fileText = (name) => latest.current.files.find((file) => file.name === name)?.content
    const writeFile = (name, content) => {
      const current = latest.current.files
      if (current.some((file) => file.name === name)) {
        latest.current.onFilesChange(current.map((file) => (file.name === name ? { ...file, content } : file)))
        return true
      }
      const problem = validateBackendPath(name, current)
      if (problem) {
        print(`Could not create ${name}: ${problem}`, 'err')
        return false
      }
      latest.current.onFilesChange([...current, { name, language: languageForFile(name), content }])
      return true
    }

    const install = async (requirements, record) => {
      print(`Installing ${requirements.join(', ')}…`, 'dim')
      const { results = [], stdout, stderr } = await latest.current.api.install(requirements)
      print(stdout)
      print(stderr, 'err')
      for (const item of results) {
        if (!item.ok) print(`ERROR: ${item.name} ${item.error}`, 'err')
        else if (item.already) print(`Requirement already satisfied: ${item.name}${item.version ? ` (${item.version})` : ''}`, 'dim')
        else print(`Successfully installed ${item.name}${item.version ? `-${item.version}` : ''}`, 'ok')
      }
      // Packages that install (or fail) but can't reach their server from the browser: say
      // so now, with an alternative, instead of leaving a ConnectionError for later. Only for
      // packages this command installed or failed; ones already there were explained before.
      const hints = new Set(results
        .filter((item) => !item.already)
        .map((item) => installHint(item.requirement || item.name, { fromFile: !record }))
        .filter(Boolean))
      hints.forEach((hint) => print(hint, 'warn'))
      const installed = results.filter((item) => item.ok)
      if (record && installed.length) {
        const { text, added } = addRequirements(fileText(REQUIREMENTS_FILE) ?? '', installed.map((item) => item.requirement))
        if (added.length && writeFile(REQUIREMENTS_FILE, text)) print(`Added ${added.join(', ')} to ${REQUIREMENTS_FILE}`, 'dim')
      }
      if (latest.current.api.ready && installed.some((item) => !item.already)) {
        print('Press Run (or uvicorn app.main:app --reload) so your API imports the new package.', 'dim')
      }
      return results.length > 0 && results.every((item) => item.ok)
    }

    const perform = async (action, depth) => {
      switch (action.kind) {
        case 'none':
          return true
        case 'message':
          print(action.text, action.ok ? 'out' : 'err')
          return action.ok
        case 'clear':
          latest.current.onClearRequests?.()
          update(key, () => ({ entries: [], clearedResult: latest.current.api.runner.result }))
          return true
        case 'ls': {
          const names = listFolder(latest.current.files, action.path)
          if (!names.length && action.path) {
            print(`ls: cannot access '${action.path}': No such file or directory`, 'err')
            return false
          }
          print(names.join('  '))
          return true
        }
        case 'cat': {
          const text = fileText(action.file.replace(/^\.\//, ''))
          if (text === undefined) {
            print(`cat: ${action.file}: No such file or directory`, 'err')
            return false
          }
          print(text)
          return true
        }
        case 'install': {
          if (action.packages) return install(action.packages, true)
          const text = fileText(action.fromFile.replace(/^\.\//, ''))
          if (text === undefined) {
            if (action.quietIfMissing) {
              print(`No ${REQUIREMENTS_FILE} here, so there is nothing to install. Add Python packages with pip install <package>.`)
              return true
            }
            print(`ERROR: Could not open requirements file: ${action.fromFile}`, 'err')
            return false
          }
          const requirements = parseRequirements(text)
          if (!requirements.length) {
            print(`${action.fromFile} lists no packages.`)
            return true
          }
          return install(requirements, false)
        }
        case 'uninstall': {
          const { text, removed } = removeRequirements(fileText(REQUIREMENTS_FILE) ?? '', action.names)
          const gone = new Set(removed.map(normalizeName))
          const missing = action.names.filter((name) => !gone.has(normalizeName(name)))
          missing.forEach((name) => print(`WARNING: Skipping ${name} as it is not in ${REQUIREMENTS_FILE}`, 'dim'))
          if (removed.length && writeFile(REQUIREMENTS_FILE, text)) {
            print(`Removed ${removed.join(', ')} from ${REQUIREMENTS_FILE}. A loaded package stays available until you Stop and Run again.`)
          }
          return true
        }
        case 'pipList': {
          const packages = await latest.current.api.pipList()
          if (action.freeze) {
            print(packages.map((item) => `${item.name}==${item.version}`).join('\n'))
          } else {
            const width = Math.max(7, ...packages.map((item) => item.name.length)) + 2
            print([`${'Package'.padEnd(width)}Version`, `${'-'.repeat(width - 2)}  -------`, ...packages.map((item) => `${item.name.padEnd(width)}${item.version}`)].join('\n'))
          }
          return true
        }
        case 'exec': {
          const { code, stdout, stderr } = await latest.current.api.exec({ files: latest.current.files, mode: action.mode, target: action.target, args: action.args })
          print(stdout)
          print(stderr, 'err')
          if (code !== 0 && !stderr) print(`Exited with code ${code}`, 'err')
          return code === 0
        }
        case 'relayStatus': {
          const status = await latest.current.api.relayStatus()
          if (!status.enabled) {
            print('Relay: not enabled on this site yet. Payment APIs cannot be called from the playground.')
            return true
          }
          print(relayStatusText(createRelayMatcher(status.listing), status.usage, { loggedIn: status.loggedIn }))
          return true
        }
        case 'run':
          print('Starting your API (same as Run). Its output appears above, and requests are logged as they arrive.', 'dim')
          latest.current.onRun?.()
          return true
        case 'script':
          if (depth >= MAX_SCRIPT_DEPTH) {
            print(`npm scripts call each other too deeply (stopped at "${action.name}").`, 'err')
            return false
          }
          print(`> ${action.name}\n> ${action.command}`, 'dim')
          return runLine(action.command, depth + 1)
        default:
          return false
      }
    }

    const runLine = async (text, depth) => {
      for (const tokens of splitCommand(text)) {
        const action = resolveCommand(tokens, { packageJson: fileText(PACKAGE_FILE) ?? null })
        if (!(await perform(action, depth))) return false
      }
      return true
    }

    let ok = false
    try {
      ok = await runLine(command, 0)
    } catch (error) {
      print(error?.message || 'The command failed.', 'err')
    }
    update(key, (current) => ({ busy: false, entries: current.entries.map((entry) => (entry.id === id ? { ...entry, status: ok ? 'ok' : 'error', endedAt: Date.now() } : entry)) }))
  }, [update, workspaceKey])

  // API relay refusals go under the command that was running when they arrived. The worker
  // sends them before its reply, so `at` falls inside the command's time window.
  const seenNotice = useRef(0)
  const notices = api.relayNotices
  useEffect(() => {
    try {
      const fresh = (notices ?? []).filter((notice) => notice.id > seenNotice.current)
      if (!fresh.length) return
      seenNotice.current = fresh[fresh.length - 1].id
      setState((current) => ({
        ...current,
        entries: current.entries.map((entry) => {
          const mine = fresh.filter((notice) => notice.at >= entry.startedAt && notice.at <= (entry.endedAt ?? Infinity) + NOTICE_GRACE_MS)
          return mine.length ? { ...entry, lines: [...entry.lines, ...mine.map((notice) => ({ text: notice.text, tone: 'warn' }))] } : entry
        }),
      }))
    } catch (error) {
      console.warn('Relay notices not shown in the terminal:', error?.message)
    }
  }, [notices])

  return { ...terminal, execute }
}
