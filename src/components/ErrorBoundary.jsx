import { Component } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

// No error-tracking service wired up yet - componentDidCatch logs to console so
// failures are at least visible in the browser console / any log aggregation
// that captures console output, rather than disappearing silently.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught a render error:', error, info)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    const { hasError } = this.state
    const { fallback, children } = this.props
    if (hasError) {
      return fallback ? fallback(this.reset) : (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <FiAlertTriangle className="h-8 w-8 text-red-500" />
          <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">Something went wrong.</p>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-4 py-2 text-xs font-semibold text-white dark:text-ink-950"
          >
            <FiRefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      )
    }
    return children
  }
}
