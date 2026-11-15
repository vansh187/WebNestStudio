import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiCode, FiCopy, FiExternalLink, FiLock, FiMonitor, FiShield, FiX,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useSeo } from '../hooks/useSeo'
import { appDisplayName, callbackUrl, createVscodeLoginCode, readLoginRequest } from '../api/vscode'
import { getErrorDetail } from '../lib/apiClient'

// Browser half of the VS Code login (OAuth 2.0 authorization code + PKCE). The extension opens
// /vscode/connect?state&code_challenge&code_challenge_method&redirect_uri&device_name&ext_version&app_scheme&source.
// Contract: VSCODE_EXTENSION_BACKEND.md section 2.2. The login code is never logged or sent to analytics.

const panelClass = 'rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/50'

const PROBLEMS = {
  missing: {
    title: 'Start from VS Code',
    body: 'This page finishes a login that VS Code starts. In VS Code, open the WebNest AI panel and click Log in. Your browser will come back here with everything it needs.',
  },
  redirect: {
    title: 'This login link is not valid',
    body: 'The link does not point back to the WebNest AI extension, so it was changed or did not come from VS Code. Close this tab and click Log in again in VS Code.',
  },
  invalid: {
    title: 'This login link is incomplete',
    body: 'Part of the link is missing or was cut off. Close this tab and click Log in again in VS Code. If you copied the link, copy the whole thing.',
  },
}

function connectError(err) {
  const code = err?.response?.data?.code
  if (code === 'invalid_redirect_uri') return 'This login link was changed. Close this tab and click Log in again in VS Code.'
  if (code === 'rate_limited') return 'Too many login attempts. Wait a minute, then try again.'
  if (code === 'service_unavailable') return 'WebNest AI for VS Code is not available right now. Try again later.'
  if (code === 'validation_error') return 'This login link is incomplete. Close this tab and click Log in again in VS Code.'
  return getErrorDetail(err, 'We could not connect VS Code. Try again.')
}

export default function VscodeConnect() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { request, problem } = useMemo(() => readLoginRequest(searchParams), [searchParams])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { code, expiresIn, link }
  const [cancelled, setCancelled] = useState(false)
  const [copied, setCopied] = useState(false)

  useSeo({
    title: 'Connect VS Code to WebNest',
    description: 'Securely connect the WebNest AI extension for VS Code to your account.',
    path: '/vscode/connect',
    noindex: true,
  })

  const appName = request ? appDisplayName(request.appScheme) : 'VS Code'
  const deviceName = request?.deviceName || 'this computer'

  const connect = async () => {
    if (!request || busy) return
    setBusy(true)
    setError('')
    try {
      const { code, expiresIn } = await createVscodeLoginCode(request)
      const link = callbackUrl(request.redirectUri, { code, state: request.state })
      setResult({ code, expiresIn, link })
      window.location.assign(link)
    } catch (err) {
      setError(connectError(err))
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    if (!request) return
    setCancelled(true)
    window.location.assign(callbackUrl(request.redirectUri, { error: 'access_denied', state: request.state }))
  }

  const copyCode = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  let body
  if (problem) {
    const p = PROBLEMS[problem]
    body = (
      <div role="alert" className="rounded-2xl border border-amber-300/70 bg-amber-50 p-6 dark:border-amber-400/30 dark:bg-amber-400/10">
        <FiAlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-300" />
        <h2 className="mt-3 text-lg font-bold text-amber-900 dark:text-amber-100">{p.title}</h2>
        <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">{p.body}</p>
      </div>
    )
  } else if (result) {
    const minutes = Math.max(1, Math.round(result.expiresIn / 60))
    body = (
      <div role="status">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><FiCheck className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-bold text-ink-900 dark:text-white">Approved. Opening {appName}…</h2>
            <p className="mt-1 text-sm leading-6 text-ink-600 dark:text-ink-300">If your browser asks, allow it to open {appName}. You can close this tab once VS Code says you are logged in.</p>
          </div>
        </div>

        <a href={result.link} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#007acc] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#007acc]/20 transition hover:bg-[#0065a8]">
          Open {appName} <FiExternalLink className="h-4 w-4" />
        </a>

        <div className="mt-7 rounded-2xl border border-ink-200 bg-ink-50 p-5 dark:border-ink-700 dark:bg-ink-950">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{appName} didn&apos;t open?</p>
          <p className="mt-1 text-sm leading-6 text-ink-600 dark:text-ink-300">Copy this code, click <strong>Paste a code</strong> in VS Code and paste it. It works once and expires in {minutes} {minutes === 1 ? 'minute' : 'minutes'}.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              aria-label="Login code"
              value={result.code}
              onFocus={(event) => event.target.select()}
              className="min-w-0 flex-1 rounded-xl border border-ink-300 bg-white px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-[#007acc] dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <button type="button" onClick={copyCode} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-[#007acc] hover:text-[#007acc] dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
              {copied ? <><FiCheck className="h-4 w-4" /> Copied</> : <><FiCopy className="h-4 w-4" /> Copy code</>}
            </button>
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-400/10 dark:text-red-300">
            <FiLock className="mt-0.5 h-4 w-4 shrink-0" /> Never share this code with anyone. WebNest will never ask you for it.
          </p>
        </div>
      </div>
    )
  } else if (cancelled) {
    body = (
      <div role="status" className="rounded-2xl border border-ink-200 bg-ink-50 p-6 dark:border-ink-700 dark:bg-ink-950">
        <FiX className="h-6 w-6 text-ink-500" />
        <h2 className="mt-3 text-lg font-bold text-ink-900 dark:text-white">Login cancelled</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">Nothing was connected. You can close this tab.</p>
      </div>
    )
  } else {
    body = (
      <>
        <h2 className="text-xl font-bold text-ink-900 dark:text-white">
          Connect {appName} on <span className="break-all text-[#007acc] dark:text-sky-300">{deviceName}</span> to your WebNest account?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
          Only continue if you just clicked <strong className="text-ink-900 dark:text-white">Log in</strong> in VS Code yourself. The extension will be able to use WebNest AI with your account and your Prime limits.
        </p>
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
          Signed in as <span className="font-semibold text-ink-800 dark:text-ink-100">{user?.email || 'your WebNest account'}</span>
          {request.extVersion && <> · extension {request.extVersion}</>}
        </p>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={cancel} disabled={busy} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-ink-300 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800">
            Cancel
          </button>
          <button type="button" onClick={connect} disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#007acc] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#007acc]/20 transition hover:bg-[#0065a8] disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? 'Connecting…' : <>Connect <FiArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </>
    )
  }

  return (
    <main className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-ink-50 px-4 py-10 dark:bg-ink-950 sm:px-6 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#007acc]/10 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-gold-600 dark:text-ink-300 dark:hover:text-gold-400">
          <FiArrowLeft className="h-4 w-4" /> Back to your account
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:items-stretch">
          <section className={`${panelClass} overflow-hidden shadow-xl shadow-ink-900/5 dark:shadow-black/20`}>
            <div className="border-b border-ink-100 bg-gradient-to-br from-[#007acc]/10 via-transparent to-gold-400/10 px-6 py-7 dark:border-ink-800 sm:px-9 sm:py-9">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#007acc] text-white shadow-lg shadow-[#007acc]/20">
                  <FiCode className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#007acc] dark:text-sky-300">WebNest AI × VS Code</p>
                  <h1 className="mt-2 font-display text-2xl font-bold text-ink-950 dark:text-white sm:text-3xl">Connect your editor</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-600 dark:text-ink-300">
                    Log the WebNest AI extension in with your WebNest account. You never type your password into VS Code.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-9">{body}</div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className={`${panelClass} p-6 sm:p-7`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-600 dark:text-gold-300"><FiShield className="h-5 w-5" /></span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">A secure, one-time link</h2>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-ink-600 dark:text-ink-300">
                <li className="flex gap-2"><FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> The login code works once and expires in 5 minutes.</li>
                <li className="flex gap-2"><FiLock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Only approve a login you started in VS Code.</li>
                <li className="flex gap-2"><FiMonitor className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Disconnect devices any time from your account.</li>
              </ul>
            </section>
            <section className="rounded-2xl border border-[#007acc]/20 bg-[#007acc]/5 p-6 dark:border-sky-300/20 dark:bg-sky-300/5">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">Wrong account?</p>
              <p className="mt-1 break-all text-sm text-[#007acc] dark:text-sky-300">{user?.email || 'Your signed-in WebNest account'}</p>
              <p className="mt-2 text-sm leading-5 text-ink-600 dark:text-ink-300">VS Code will be connected to this account. Log out and sign in with the right one, then click Log in in VS Code again.</p>
            </section>
          </aside>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">You can review or remove access from Connected devices in your account.</p>
      </div>
    </main>
  )
}
