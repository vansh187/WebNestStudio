import { useCallback, useEffect, useRef, useState } from 'react'
import { createPaymentOrder, verifyPayment } from '../lib/codelab/assistantClient'
import { checkoutOptions, loadCheckout } from '../lib/codelab/assistantCheckout'

const ACTIVATION_TRIES = 8
const ACTIVATION_WAIT_MS = 3000

// One purchase of WebNest AI. Access comes only from the server's answer, read again through
// `refreshUsage`. A money-taken payment is never reported as failed: when the browser can't
// confirm it, the server's webhook still can, so the user is told to wait, not to pay again.
//   status: idle, starting, open (Razorpay is showing), confirming, pending, paid
export function useAssistantPayment({ user, enabled, refreshUsage }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const checkoutRef = useRef(null)
  const startedRef = useRef(false)
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [])

  // Logging out closes the payment page: it holds this account's order.
  useEffect(() => {
    if (enabled) return
    checkoutRef.current?.close()
    checkoutRef.current = null
    startedRef.current = false
  }, [enabled])

  const waitForAccess = useCallback(async () => {
    for (let attempt = 0; attempt < ACTIVATION_TRIES && aliveRef.current; attempt += 1) {
      const usage = await refreshUsage()
      if (usage?.access?.active) return true
      await new Promise((resolve) => { setTimeout(resolve, ACTIVATION_WAIT_MS) })
    }
    return false
  }, [refreshUsage])

  const settle = useCallback(async () => {
    setStatus('confirming')
    setError('')
    const active = await waitForAccess()
    startedRef.current = false
    setStatus(active ? 'paid' : 'pending')
  }, [waitForAccess])

  const onPaid = useCallback(async (response) => {
    checkoutRef.current = null
    setPaymentId(response?.razorpay_payment_id ?? '')
    setStatus('confirming')
    setError('')
    try {
      await verifyPayment(response)
    } catch {
      /* The webhook can still confirm it; settle() reads the answer either way. */
    }
    await settle()
  }, [settle])

  // `termsAcceptedAt`: when the user ticked the terms box. No payment starts without it.
  const pay = useCallback(async (termsAcceptedAt) => {
    if (startedRef.current || !termsAcceptedAt) return
    startedRef.current = true
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

  return { status, error, paymentId, pay, checkAgain: settle }
}
