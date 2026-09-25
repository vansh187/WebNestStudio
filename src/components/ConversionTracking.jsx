import { useEffect } from 'react'
import { trackEvent } from '../lib/analytics'

export default function ConversionTracking() {
  useEffect(() => {
    function onClick(event) {
      const link = event.target.closest?.('a[href]')
      if (!link) return
      const url = new URL(link.href, window.location.origin)
      if (['tel:', 'mailto:'].includes(url.protocol) || url.hostname === 'wa.me' || (url.origin === window.location.origin && url.pathname === '/contact')) {
        trackEvent('contact_clicked', { source: url.protocol === 'tel:' ? 'phone' : url.protocol === 'mailto:' ? 'email' : url.hostname === 'wa.me' ? 'whatsapp' : 'contact_page' })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
