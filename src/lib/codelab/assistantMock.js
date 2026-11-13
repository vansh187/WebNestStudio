// A stand-in for POST /api/assistant/chat, used with VITE_ASSISTANT_MOCK=1 until the backend
// is deployed. It follows the API contract (same events, same order) with scripted replies,
// so the panel, tools and approvals can be built and tested without spending AI quota.
export const mockMembership = () => ({ is_prime: true, member_label: 'WebNest Prime Member', expires_at: null })

const wait = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(new DOMException('Aborted', 'AbortError'))
    return
  }
  const timer = setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => {
    clearTimeout(timer)
    reject(new DOMException('Aborted', 'AbortError'))
  }, { once: true })
})

async function streamText(text, onEvent, signal) {
  const words = text.split(/(?<=\s)/)
  for (const word of words) {
    await wait(14, signal)
    onEvent({ type: 'text', data: { delta: word } })
  }
}

const ASK_INTRO = `**This is a mock reply.** The real AI connects once the backend is deployed.

In *Ask* mode WebNest AI explains and suggests, and **nothing in your project changes** until you press Apply. Here is an example:`

const FENCE = '```'
const ASK_SAMPLES = {
  backend: `${FENCE}python app/health.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}
${FENCE}

Then include it in \`app/main.py\` with \`app.include_router(router)\`.`,
  web: `${FENCE}css mock_theme.css
body {
  background: #f8fafc;
}
${FENCE}`,
  python: `${FENCE}python main.py
print("Hello from the mock!")
${FENCE}`,
  java: `${FENCE}java MockNotes.java
public class MockNotes {
    public String title() {
        return "mock";
    }
}
${FENCE}`,
  spring: `${FENCE}java src/main/java/com/example/demo/HealthController.java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/health")
    public String health() {
        return "ok";
    }
}
${FENCE}`,
}

ASK_SAMPLES.node = `${FENCE}javascript main.js
console.log("Hello from the mock!");
${FENCE}`
ASK_SAMPLES.express = `${FENCE}javascript routes/health.js
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
${FENCE}

Then mount it in \`server.js\` with \`app.use('/health', require('./routes/health'))\`.`

// What the scripted agent adds, per language. Python has one file, so it edits that instead.
const AGENT_FILES = {
  express: { path: 'routes/mock_notes.js', content: "module.exports = ['mock'];\n" },
  backend: { path: 'app/mock_notes.py', content: 'NOTES = ["mock"]\n\n\ndef all_notes():\n    return NOTES\n' },
  web: { path: 'mock_notes.js', content: 'console.log("mock");\n' },
  java: { path: 'MockNotes.java', content: 'public class MockNotes {\n    public String title() {\n        return "mock";\n    }\n}\n' },
  spring: { path: 'src/main/java/com/example/demo/MockNotes.java', content: 'package com.example.demo;\n\npublic class MockNotes {\n    public String title() {\n        return "mock";\n    }\n}\n' },
}

function mockChange(context) {
  if (context?.language === 'node') {
    // Node scripts have one file, so the mock agent edits that file instead of creating one.
    const open = context?.open_file
    const firstLine = open?.content?.split('\n')[0] ?? ''
    return { name: 'edit_file', arguments: { path: open?.name ?? 'main.js', old_text: firstLine, new_text: `${firstLine}\nconsole.log("Added by the mock agent");` } }
  }
  const target = AGENT_FILES[context?.language ?? 'backend']
  if (target) {
    return context?.files?.includes(target.path)
      ? { name: 'edit_file', arguments: { path: target.path, old_text: 'mock', new_text: 'mock, updated' } }
      : { name: 'create_file', arguments: target }
  }
  const open = context?.open_file
  // No project yet, as on the Agent screen's Anything: nothing to edit, so it makes a file.
  if (!open && !context?.files?.length) return { name: 'create_file', arguments: { path: 'notes.txt', content: 'mock\n' } }
  const firstLine = open?.content?.split('\n')[0] ?? ''
  return { name: 'edit_file', arguments: { path: open?.name ?? context?.files?.[0], old_text: firstLine, new_text: `# Added by the mock\n${firstLine}` } }
}

// The agent's script, chosen by how many tools have run since the user's last message.
function agentStep(messages, context) {
  const lastUser = messages.map((message) => message.role).lastIndexOf('user')
  const done = messages.slice(lastUser + 1).filter((message) => message.role === 'tool').length
  const entry = context?.files?.includes('app/main.py') ? 'app/main.py' : context?.files?.[0] ?? 'app/main.py'
  switch (done) {
    case 0:
      return { text: "**Mock agent.** I'll look at the project first.", call: { name: 'list_files', arguments: {} } }
    case 1:
      return { text: '', call: { name: 'read_file', arguments: { path: entry } } }
    case 2:
      return { text: "Now I'll make a small change. You can review it before it is saved.", call: mockChange(context) }
    case 3:
      return { text: "Next I'll run the code to check that it still works.", call: { name: 'run_project', arguments: {} } }
    default:
      return { text: 'All done. This was the scripted mock, so the change above is only an example: use **Undo all** to remove it.', call: null }
  }
}

export async function mockStreamChat({ mode, messages, context, signal, onEvent }) {
  await wait(250, signal)
  if (mode === 'ask') {
    const sample = ASK_SAMPLES[context?.language] ?? ASK_SAMPLES.python
    await streamText(`${ASK_INTRO}\n\n${sample}`, onEvent, signal)
    onEvent({ type: 'usage', data: { input_tokens: 900, output_tokens: 120, calls_used_today: 3, calls_limit: 40 } })
    onEvent({ type: 'done', data: { finish_reason: 'stop' } })
    return
  }
  const { text, call } = agentStep(messages, context)
  if (text) await streamText(text, onEvent, signal)
  if (call) onEvent({ type: 'tool_call', data: { id: `mock_${Date.now()}`, ...call } })
  onEvent({ type: 'usage', data: { input_tokens: 1200, output_tokens: 60, calls_used_today: 4, calls_limit: 40 } })
  onEvent({ type: 'done', data: { finish_reason: call ? 'tool_calls' : 'stop' } })
}

export const mockUsage = async () => ({ enabled: true, calls_used_today: 3, calls_limit: 40, access: { active: true } })
