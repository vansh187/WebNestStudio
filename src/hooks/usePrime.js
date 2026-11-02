import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  claimMembershipLoad, getMembership, isCurrentAccount, isMembershipAnswered, isPaymentPending, resetMembership, subscribeMembership,
} from '../lib/codelab/assistantPlan.js'

const never = () => false
// A failed read, say while the backend wakes up, is tried again. A member keeps their badge.
const RETRY_WAIT_MS = [3000, 10000, 30000]

// The client that reads the membership loads here, only for someone logged in: the navbar is
// on every page.
async function loadMembership(userId) {
  for (let attempt = 0; attempt <= RETRY_WAIT_MS.length; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => { setTimeout(resolve, RETRY_WAIT_MS[attempt - 1]) })
    if (!isCurrentAccount(userId) || isMembershipAnswered()) return
    const membership = await import('../lib/codelab/assistantClient').then(({ fetchMembership }) => fetchMembership()).catch(() => null)
    if (membership) return
  }
}

// The logged-in user's WebNest Prime membership.
//   answered:  the server has said whether they are a member. Until then, nothing is known.
//   showOffer: it is right to offer Prime, so not to a member, to someone whose payment is
//              being confirmed, or to someone we can't yet tell apart from a member.
export function usePrime() {
  const { user, isAuthenticated, initializing } = useAuth()
  const userId = isAuthenticated ? user?.email ?? null : null
  const membership = useSyncExternalStore(subscribeMembership, getMembership, getMembership)
  const pending = useSyncExternalStore(subscribeMembership, isPaymentPending, never)
  const known = useSyncExternalStore(subscribeMembership, isMembershipAnswered, never)

  useEffect(() => {
    if (!userId) {
      resetMembership()
      return
    }
    if (claimMembershipLoad(userId)) loadMembership(userId)
  }, [userId])

  const isPrime = Boolean(userId) && membership.is_prime
  const paymentPending = Boolean(userId) && pending
  const answered = Boolean(userId) && known

  return {
    isPrime,
    label: membership.member_label || 'WebNest Prime Member',
    expiresAt: membership.expires_at,
    paymentPending,
    answered,
    showOffer: !initializing && !isPrime && !paymentPending && (!userId || answered),
  }
}
