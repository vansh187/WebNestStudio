// WebNest Prime, as the server last reported it: GET /api/assistant/membership or a verified
// payment. Kept in memory only, and nothing here unlocks anything. No React, so it can be
// tested in Node.
const NOT_A_MEMBER = { is_prime: false, member_label: null, expires_at: null }
// Money was taken and the server hasn't confirmed it. Kept for this tab's session, so a reload
// or another screen can't offer Pay again. It holds no Prime status.
const PENDING_KEY = 'wns_ai_payment_pending'

let membership = NOT_A_MEMBER
let pending = null // { account, renewal }
let account = null
let answered = false // The server has said whether this account is a member.
const listeners = new Set()

const notify = () => listeners.forEach((listener) => listener())

function readPending(forAccount) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PENDING_KEY))
    return saved?.account === forAccount ? saved : null
  } catch {
    return null
  }
}

function savePending(value) {
  try {
    if (value) sessionStorage.setItem(PENDING_KEY, JSON.stringify(value))
    else sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* Storage is blocked: the lock still holds in memory until a reload. */
  }
}

export const getMembership = () => membership
export const isMembershipAnswered = () => answered
export const isCurrentAccount = (userId) => account === userId
export const isPaymentPending = () => Boolean(pending)
export const isPendingRenewal = () => Boolean(pending?.renewal)

export function subscribeMembership(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function markPaymentPending({ renewal = false } = {}) {
  pending = { account, renewal }
  savePending(pending)
  notify()
}

export function clearPaymentPending() {
  if (!pending) return
  pending = null
  savePending(null)
  notify()
}

// A failed read (null) changes nothing. A member buying again is already Prime, so being Prime
// says nothing about that payment: only the pass becoming active clears their lock.
export function noteMembership(data) {
  if (!data) return
  answered = true
  membership = data.is_prime === true
    ? { is_prime: true, member_label: data.member_label ?? null, expires_at: data.expires_at ?? null }
    : NOT_A_MEMBER
  if (membership.is_prime && pending && !pending.renewal) clearPaymentPending()
  notify()
}

export function notePassActive(usage) {
  if (usage?.access?.active === true) clearPaymentPending()
}

// Whether a verify response confirms this payment. See noteMembership about buying again.
export const paymentConfirmed = (result, renewal) => result?.is_prime === true && (!renewal || result.active === true)

// True the first time it is asked about this account, so only one caller loads the membership.
export function claimMembershipLoad(userId) {
  if (account === userId) return false
  account = userId
  answered = false
  membership = NOT_A_MEMBER
  pending = readPending(userId)
  notify()
  return true
}

export function resetMembership() {
  if (account === null && membership === NOT_A_MEMBER && !pending && !answered) return
  account = null
  answered = false
  membership = NOT_A_MEMBER
  pending = null
  notify()
}
