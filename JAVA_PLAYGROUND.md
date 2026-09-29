# Java playground integration

Java 17 is integrated into the existing CodeLab editor at `/codelab/playground`, and it is always listed there.

Open the playground, choose **Java 17 Playground**, and click **Run**. Use **Input** for Scanner/System.in. The main class defaults to `Main`; change it to `practice.Main` for a package or another public class name. All top-level helper classes must be in the same source file. Source and stdin use the existing local session persistence.

Compilation messages, standard output, exception stack traces, exit status, truncation/time-limit notices, and the playground request ID appear in the existing Output panel. **Stop** cancels the HTTP request. Java has a 10-second compilation limit and 5-second runtime limit.

## Endpoint

The endpoint is one constant, `JAVA_PLAYGROUND_ENDPOINT` in `src/lib/codelab/javaRunner.js`:

```
https://webneststudiobackend-n00h.onrender.com/api/java/run
```

It is used in both `npm run dev` and production, and no environment variable is needed. Never embed Google credentials or other secrets in the frontend.

## Flow

`browser → backend POST /api/java/run (public, rate-limited) → private Cloud Run playground`.

- No login is required, the same as Python and HTML. If a visitor is logged in, the shared axios client attaches their token and the backend applies its limit to that account.
- The frontend sends requests through the shared axios instance in `src/lib/apiClient.js`, with a 90 s timeout (a Render cold start plus a Cloud Run cold start plus the run) and no automatic 503 retry. `useCodeRunner` has its own 95 s limit. After 5 s, the Output panel shows "Starting the Java runner…".
- Compile errors, exceptions and time limits come back as HTTP 200 with a `status` field. HTTP errors use `{ detail }`. A 422 means invalid input. A 429 means a per-visitor limit (6/min, 100/day), the site-wide daily cap, or a busy runner, and its detail text is shown as-is. A 503 means the runner is starting or unavailable.
- Only the backend holds the Google service credentials. Java source goes only to this endpoint, never to JDoodle.

`npm test` includes request/response adapter tests alongside existing tests. `npm run lint` and `node node_modules/vite/bin/vite.js build` check the frontend.
