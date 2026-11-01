import { useCallback, useEffect, useRef, useState } from 'react'
import { createPaymentOrder, fetchMembership, verifyPayment } from '../lib/codelab/assistantClient'
import { checkoutOptions, loadCheckout } from '../lib/codelab/assistantCheckout'
import {
  clearPaymentPending, getMembership, isPaymentPending, isPendingRenewal, markPaymentPending, noteMembership, paymentConfirmed,
} from '../lib/codelab/assistantPlan.js'
import { getUser } from '../lib/tokenStore'
import { usePrime } from './usePrime'

const CONFIRM_TRIES = 12
const CONFIRM_WAIT_MS = 5000
const NOT_VERIFIED = 'This payment could not be verified. If money was deducted, please contact support.'

// One purchase of WebNest AI. Membership comes only from the server, never from Checkout's
// callback. A money-taken payment is never reported as failed unless the server rejects it:
// its webhook can still confirm the payment, so the user is told to wait, not to pay again.
//   status: idle, starting, open (Razorpay is showing), verifying, confirming, pending,
//           rejected, paid
export function useAssistantPayment({ user, enabled, refreshUsage }) {
  const { paymentPending } = usePrime()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [verified, setVerified] = useState(null)
  const checkoutRef = useRef(null)
  const startedRef = useRef(false)
  const renewalRef = useRef(false)
  const wasPendingRef = useRef(paymentPending)

  // Logging out closes the payment page: it holds this account's order.
  useEffect(() => {
    if (enabled) return
    checkoutRef.current?.close()
    checkoutRef.current = null
    startedRef.current = false
    setStatus('idle')
    setError('')
    setVerified(null)
  }, [enabled])

  // Confirmed from another screen, or on load: this screen's plan is out of date.
  useEffect(() => {
    if (wasPendingRef.current && !paymentPending && enabled) refreshUsage()
    wasPendingRef.current = paymentPending
  }, [enabled, paymentPending, refreshUsage])

  const finish = useCallback(async () => {
    clearPaymentPending()
    await refreshUsage()
    startedRef.current = false
    setStatus('paid')
  }, [refreshUsage])

  // Keeps going if this screen closes, so the rest of the app still learns the answer.
  const settle = useCallback(async (renewal) => {
    const account = getUser()?.email
    setStatus('confirming')
    setError('')
    for (let attempt = 0; attempt < CONFIRM_TRIES; attempt += 1) {
      if (attempt > 0) await new Promise((resolve) => { setTimeout(resolve, CONFIRM_WAIT_MS) })
      if (getUser()?.email !== account) return
      const membership = await fetchMembership()
      const confirmed = membership?.is_prime === true && (!renewal || (await refreshUsage())?.access?.active === true)
      if (confirmed) {
        await finish()
        return
      }
    }
    startedRef.current = false
    setStatus('pending')
  }, [finish, refreshUsage])

  const onPaid = useCallback(async (response) => {
    const renewal = renewalRef.current
    checkoutRef.current = null
    setPaymentId(response?.razorpay_payment_id ?? '')
    setError('')
    setStatus('verifying')
    markPaymentPending({ renewal })
    try {
      const result = await verifyPayment(response)
      if (paymentConfirmed(result, renewal)) {
        noteMembership(result)
        setVerified(result)
        await finish()
        return
      }
    } catch (failure) {
      if (failure?.status === 400 || failure?.status === 404) {
        clearPaymentPending()
        startedRef.current = false
        setStatus('rejected')
        setError(NOT_VERIFIED)
        return
      }
      /* Not an answer about this payment: the checks below read the server's answer. */
    }
    await settle(renewal)
  }, [finish, settle])

  // `termsAcceptedAt`: when the user ticked the terms box. No payment starts without it.
  const pay = useCallback(async (termsAcceptedAt) => {
    if (startedRef.current || !termsAcceptedAt || isPaymentPending()) return
    startedRef.current = true
    renewalRef.current = getMembership().is_prime
    setStatus('starting')
    setError('')
    try {
      const [order] = await Promise.all([createPaymentOrder(), loadCheckout()])
      const checkout = new window.Razorpay(checkoutOptions(order, user, {
        onPaid,
        termsAcceptedAt,
        onClose: () => {
          checkoutRef.current = null
          startedRef.current = false
          setStatus('idle')
        },
      }))
      // The payment page stays open for another try, so this only explains what happened.
      checkout.on('payment.failed', (response) => {
        setError(response?.error?.description || 'The payment did not go through. Please try again.')
      })
      checkoutRef.current = checkout
      setStatus('open')
      checkout.open()
    } catch (failure) {
      startedRef.current = false
      setStatus('idle')
      // Already has access, as in a payment made in another tab.
      if (failure?.status === 409) {
        await refreshUsage()
        return
      }
      setError(failure?.message || 'Could not start the payment. Please try again.')
    }
  }, [onPaid, refreshUsage, user])

  const checkAgain = useCallback(() => settle(isPendingRenewal()), [settle])

  return {
    // Another screen, or this tab before a reload, may be the one waiting for the payment.
    status: status === 'idle' && paymentPending ? 'pending' : status,
    error,
    paymentId,
    verified,
    pay,
    checkAgain,
  }
}
