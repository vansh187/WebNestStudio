// Stepping through a recorded run (the Web debugger): the recording is a list of steps, each
// { file, line, depth, frame, fn, at, vars, stack } (see webDebugRuntime.js). These turn a
// step into the same pause a live debugger gives (FastAPI, Python) and find where each
// stepping command lands, forwards and backwards. No React, so it can be tested in Node.

// The variables of `frameId` as last recorded at or before step `index`.
function lastVars(steps, index, frameId) {
  for (let i = index; i >= 0; i -= 1) {
    if (steps[i].frame === frameId) return steps[i].vars ?? []
  }
  return []
}

// The pause at step `index`: { file, line, depth, frames } with frames innermost first, each
// { fn, file, line, first, level, vars } (level counted from the outermost, the global code).
export function pauseAt(steps, index) {
  const step = steps[index]
  if (!step) return null
  const stack = step.stack ?? []
  // The global code is the outermost frame; where it was is its last own step.
  let global = step
  for (let i = index; i >= 0; i -= 1) {
    if (steps[i].frame === 0) {
      global = steps[i]
      break
    }
  }
  const outermostFirst = [
    { fn: '(global)', file: global.file, line: stack.length ? global.line : step.line, first: 1, level: 0, vars: lastVars(steps, index, 0) },
    ...stack.map((entry, position) => ({
      fn: entry.fn,
      file: entry.file,
      line: position === stack.length - 1 ? step.line : entry.line,
      first: entry.first,
      level: position + 1,
      vars: lastVars(steps, index, entry.id),
    })),
  ]
  // Innermost first, like the live debuggers.
  return { index, file: step.file, line: step.line, depth: step.depth, frames: outermostFirst.reverse() }
}

const isBreakpoint = (step, breakpoints) => breakpoints.some((point) => point.file === step.file && point.line === step.line)

// Where a command lands from step `index`, or `index` when there is nowhere to go.
//   into / back:          the next / previous step
//   over / backOver:      the next / previous step not deeper than this one
//   out / backOut:        the next / previous step shallower than this one
//   continue / reverse:   the next / previous step on a breakpoint, else the last / first step
export function target(steps, index, command, breakpoints = []) {
  const last = steps.length - 1
  if (last < 0) return 0
  const depth = steps[index]?.depth ?? 0
  const forward = (match, fallback = index) => {
    for (let i = index + 1; i <= last; i += 1) if (match(steps[i])) return i
    return fallback
  }
  const backward = (match, fallback = index) => {
    for (let i = index - 1; i >= 0; i -= 1) if (match(steps[i])) return i
    return fallback
  }
  switch (command) {
    case 'into': return Math.min(index + 1, last)
    case 'back': return Math.max(index - 1, 0)
    case 'over': return forward((step) => step.depth <= depth, last)
    case 'backOver': return backward((step) => step.depth <= depth, 0)
    case 'out': return forward((step) => step.depth < depth, last)
    case 'backOut': return backward((step) => step.depth < depth, 0)
    case 'continue': return forward((step) => isBreakpoint(step, breakpoints), last)
    case 'reverse': return backward((step) => isBreakpoint(step, breakpoints), 0)
    default: return index
  }
}

// Where to start: the first step on a breakpoint, else the first step.
export function startIndex(steps, breakpoints = []) {
  const found = steps.findIndex((step) => isBreakpoint(step, breakpoints))
  return found >= 0 ? found : 0
}

// The Execution trace: each call with its end ({ id, fn, file, line, depth, ms, error }), and
// the first step inside it, so a click can jump there.
export function traceCalls(calls = [], ends = new Map(), steps = []) {
  const firstStep = new Map()
  steps.forEach((step, index) => {
    if (step.frame && !firstStep.has(step.frame)) firstStep.set(step.frame, index)
  })
  return calls.map((call) => {
    const end = ends.get(call.id)
    return { ...call, ms: end?.ms ?? null, error: end?.error ?? null, step: firstStep.get(call.id) ?? null }
  })
}
