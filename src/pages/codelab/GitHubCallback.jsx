import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiGithub, FiLoader } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { github, safeReturnTo } from '../../lib/github'
import { ERROR_KIND, describeGitHubError } from '../../lib/github/errors'

// GitHub sends the learner back here after "Connect GitHub". The code is single use, so
// the exchange runs once per state even under StrictMode's double effects.
const exchanged = new Set()

const DENIED = {
  access_denied: 'You cancelled the GitHub sign-in. Nothing was connected.',
}

export default function GitHubCallback() {
  useSeo({ title: 'Connecting GitHub', path: '/codelab/github/callback', noindex: true })
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, initializing } = useAuth()
  const [error, setError] = useState(null)
  const started = useRef(false)

  useEffect(() => {
    // Coming back from GitHub is a full page load: the WebNest session is restored from
    // the refresh token first, so wait for that before deciding the user is logged out.
    if (started.current || initializing) return
    started.current = true
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    const state = params.get('state')
    const denied = params.get('error')

    if (denied) {
      setError({ kind: ERROR_KIND.OAUTH_FAILED, message: DENIED[denied] ?? params.get('error_description') ?? 'GitHub did not complete the sign-in.' })
      return
    }
    if (!code || !state) {
      setError({ kind: ERROR_KIND.INVALID_STATE, message: 'This page needs a sign-in code from GitHub. Start Connect GitHub from the playground.' })
      return
    }
    if (!isAuthenticated) {
      toast.info('Log in to WebNest to finish connecting GitHub.')
      navigate('/login', { state: { from: location } })
      return
    }
    if (exchanged.has(state)) return
    exchanged.add(state)

    github.completeOAuth(code, state)
      .then((result) => {
        toast.success(`GitHub connected as ${result.login ?? 'your account'}.`)
        navigate(safeReturnTo(result.return_to), { replace: true })
      })
      .catch((err) => {
        const info = describeGitHubError(err)
        if (info.kind === ERROR_KIND.LOGIN) {
          toast.info(info.message)
          navigate('/login', { state: { from: location } })
          return
        }
        setError(info)
      })
  }, [location, navigate, toast, isAuthenticated, initializing])

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      {error ? (
        <div role="alert" className="flex flex-col items-center gap-3">
          <FiAlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-ink-900 dark:text-white">{error.message}</p>
          <Link to="/codelab/playground" className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-semibold text-white dark:bg-gold-400 dark:text-ink-950">
            Back to the playground
          </Link>
        </div>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300" aria-live="polite">
          <FiGithub className="h-5 w-5" /> <FiLoader className="h-4 w-4 animate-spin" /> Connecting your GitHub account…
        </p>
      )}
    </div>
  )
}
