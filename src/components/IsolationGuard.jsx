import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isIsolated, isIsolationUrl } from '../lib/codelab/isolation'

// An isolated page (the playground while debugging, see lib/codelab/isolation.js) blocks
// cross-origin iframes such as lesson videos. Client-side navigation would keep that
// document, so leaving the isolated URL loads the next page in full, without isolation.
export default function IsolationGuard() {
  const location = useLocation()

  useEffect(() => {
    if (isIsolated() && !isIsolationUrl(location)) {
      window.location.replace(`${location.pathname}${location.search}${location.hash}`)
    }
  }, [location])

  return null
}
