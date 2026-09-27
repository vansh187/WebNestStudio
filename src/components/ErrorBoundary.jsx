import { Component } from 'react'
import { useInRouterContext, useLocation } from 'react-router-dom'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { isChunkLoadError } from '../lib/chunkReload'

// No error-tracking service wired up yet - componentDidCatch logs to console so
// failures are at least visible in the browser console / any log aggregation
// that captures console output, rather than disappearing silently.
class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, failedRetry: false, resetKey: props.resetKey }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    // Navigating to another page clears the error instead of leaving it stuck.
    if (props.resetKey !== state.resetKey) return { error: null, failedRetry: false, resetKey: props.resetKey }
    return null
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught a render error:', error, info)
  }

  retry = () => {
    // A missing chunk (typically a tab opened before a deploy) or a second
    // failure in a row cannot be fixed by re-rendering: React.lazy caches the
    // failed import. Only a reload loads the current version of the page.
    if (isChunkLoadError(this.state.error) || this.state.failedRetry) {
      window.location.reload()
      return
    }
    this.setState({ error: null, failedRetry: true })
  }

  render() {
    const { error, failedRetry } = this.state
    const { fallback, children } = this.props
    if (!error) return children
    if (fallback) return fallback(this.retry)

    const needsReload = isChunkLoadError(error) || failedRetry
    return (
      <div role="alert" className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <FiAlertTriangle className="h-8 w-8 text-red-500" />
        <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">
          {isChunkLoadError(error) ? 'A newer version of this page is available.' : 'Something went wrong.'}
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-4 py-2 text-xs font-semibold text-white dark:text-ink-950"
        >
          <FiRefreshCw className="h-3.5 w-3.5" /> {needsReload ? 'Reload page' : 'Try again'}
        </button>
      </div>
    )
  }
}

function RoutedBoundary(props) {
  const { pathname } = useLocation()
  return <Boundary resetKey={pathname} {...props} />
}

// Inside the router the boundary resets on navigation; the app-level boundary
// (outside the router) behaves as a plain boundary.
export default function ErrorBoundary(props) {
  return useInRouterContext() ? <RoutedBoundary {...props} /> : <Boundary {...props} />
}
