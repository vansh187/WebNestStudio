import { useEffect, useState } from 'react'
import { FiLoader } from 'react-icons/fi'
import { subscribeSlowRequest } from '../lib/apiClient'

export default function SlowRequestBanner() {
  const [slow, setSlow] = useState(false)

  useEffect(() => subscribeSlowRequest(setSlow), [])

  if (!slow) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-gold-400 px-4 py-2 text-xs font-semibold text-ink-950 sm:text-sm">
      <FiLoader className="h-4 w-4 animate-spin" />
      Waking up the server, this can take up to a minute on first load...
    </div>
  )
}
