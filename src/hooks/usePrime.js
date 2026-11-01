import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  claimMembershipLoad, getMembership, isPaymentPending, resetMembership, subscribeMembership,
} from '../lib/codelab/assistantPlan.js'

const notPending = () => false

// The logged-in user's WebNest Prime membership. The navbar is on every page, so the client
// that reads it loads separately, and only for someone logged in.
export function usePrime() {
  const { user, isAuthenticated } = useAuth()
  const userId = isAuthenticated ? user?.email ?? null : null
  const membership = useSyncExternalStore(subscribeMembership, getMembership, getMembership)
  const paymentPending = useSyncExternalStore(subscribeMembership, isPaymentPending, notPending)

  useEffect(() => {
    if (!userId) {
      resetMembership()
      return
    }
    if (!claimMembershipLoad(userId)) return
    import('../lib/codelab/assistantClient').then(({ fetchMembership }) => fetchMembership()).catch(() => {})
  }, [userId])

  return {
    isPrime: Boolean(userId) && membership.is_prime,
    label: membership.member_label || 'WebNest Prime Member',
    expiresAt: membership.expires_at,
    paymentPending: Boolean(userId) && paymentPending,
  }
}
