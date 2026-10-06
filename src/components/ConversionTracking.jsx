import { useEffect } from 'react'
import { trackEvent } from '../lib/analytics'

export default function ConversionTracking() {
  useEffect(() => {
    function onClick(event) {
      const link = event.target.closest?.('a[href]')
      if (!link) return
      const url = new URL(link.href, window.location.origin)
      const toContactPage = url.origin === window.location.origin && url.pathname === '/contact'
      if (['tel:', 'mailto:'].includes(url.protocol) || url.hostname === 'wa.me' || toContactPage) {
        trackEvent('contact_clicked', { source: url.protocol === 'tel:' ? 'phone' : url.protocol === 'mailto:' ? 'email' : url.hostname === 'wa.me' ? 'whatsapp' : 'contact_page' })
      }
      // Named funnel events; `page` is the path the click happened on.
      if (url.hostname === 'wa.me') trackEvent('whatsapp_click', { page: window.location.pathname })
      if (toContactPage && window.location.pathname !== '/contact') trackEvent('contact_cta_click', { page: window.location.pathname })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
