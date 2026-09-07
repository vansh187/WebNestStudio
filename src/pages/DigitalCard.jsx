import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiDownload,
  FiDownloadCloud,
  FiGlobe,
  FiInstagram,
  FiMail,
  FiPhone,
  FiShare2,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Reveal from '../components/Reveal'
import NewsletterForm from '../components/forms/NewsletterForm'
import { useSeo, SITE_URL } from '../hooks/useSeo'
import { CONTACT } from '../data/site'
import logoMark from '../assets/logo.png'

const CARD_URL = `${SITE_URL}/card`

// Rendered by a public QR image service (goqr.me) rather than a bundled library -
// keeps the build lean and dependency-free. Sends `Access-Control-Allow-Origin: *`,
// so the Download button can fetch it as a blob for a real file save.
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=0&data=${encodeURIComponent(CARD_URL)}`

// vCard 3.0 - opens the native "Add Contact" sheet on iOS/Android and imports
// cleanly into Google/Apple/Outlook contacts on desktop.
function buildVCard() {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Duggal;Vansh;;;',
    'FN:Vansh Duggal',
    'ORG:WebNest Studio',
    'TITLE:Founder',
    `TEL;TYPE=CELL:${CONTACT.phone.replace(/\s+/g, '')}`,
    `EMAIL;TYPE=WORK:${CONTACT.email}`,
    `URL:${SITE_URL}`,
    'NOTE:WebNest Studio - Where brands go digital.',
    'END:VCARD',
  ].join('\r\n')
}

function saveContact() {
  const blob = new Blob([buildVCard()], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Vansh-Duggal-WebNest-Studio.vcf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const ACTIONS = [
  {
    key: 'save',
    label: 'Save Contact',
    hint: 'Add to your phone',
    icon: FiDownloadCloud,
    onClick: saveContact,
    primary: true,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Chat with us now',
    icon: FaWhatsapp,
    href: CONTACT.whatsappHref,
    external: true,
  },
  {
    key: 'call',
    label: 'Call',
    hint: CONTACT.phone,
    icon: FiPhone,
    href: CONTACT.phoneHref,
  },
  {
    key: 'email',
    label: 'Email',
    hint: CONTACT.email,
    icon: FiMail,
    href: CONTACT.emailHref,
  },
  {
    key: 'website',
    label: 'Visit Website',
    hint: 'webneststudio.co.in',
    icon: FiGlobe,
    href: SITE_URL,
    external: true,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    hint: '@webneststudio112026',
    icon: FiInstagram,
    href: CONTACT.instagramHref,
    external: true,
  },
]

export default function DigitalCard() {
  useSeo({
    title: 'Digital Card',
    description:
      'WebNest Studio digital business card - save our contact, message us on WhatsApp, or book a free consultation in one tap.',
    path: '/card',
  })

  const [shared, setShared] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)

  const downloadQr = async () => {
    try {
      const res = await fetch(QR_SRC)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'webnest-studio-card-qr.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Blob fetch blocked - fall back to just opening the image so the
      // visitor can save it manually.
      window.open(QR_SRC, '_blank', 'noopener,noreferrer')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'WebNest Studio',
      text: 'WebNest Studio - Where brands go digital.',
      url: CARD_URL,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CARD_URL)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {
      /* user dismissed the share sheet, or clipboard blocked - nothing to do */
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink-950 px-5 py-10 text-white sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(230,172,62,0.18),transparent_38%),radial-gradient(circle_at_85%_85%,rgba(230,172,62,0.12),transparent_40%),linear-gradient(160deg,rgba(5,6,9,0.96),rgba(18,21,30,0.9))]" />

      {/* m-auto (not just mx-auto) vertically centers the card on tall tablet /
          desktop screens, and stays scroll-safe on phones where the card is
          taller than the viewport - unlike flex justify-center, auto margins
          never clip the overflow. */}
      <div className="relative m-auto w-full max-w-md">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-gold-300/25 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur">
            {/* Brand header */}
            <div className="relative border-b border-gold-300/15 px-6 pb-7 pt-8 text-center">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-200/50 to-transparent" />
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-gold-300/40 shadow-lg shadow-black/40">
                <img src={logoMark} alt="WebNest Studio" className="h-full w-full object-cover" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[0.14em]">
                WEB<span className="text-gold-300">NEST</span> STUDIO
              </h1>
              <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-gold-300/90">
                Where brands go digital
              </p>

              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/50 px-4 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-300/30 text-[0.7rem] font-bold text-gold-200">
                  WN
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight">Vansh Duggal</p>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-ink-300">
                    Founder
                  </p>
                </div>
              </div>
            </div>

            {/* QR code - point a phone camera here to open this card */}
            <div className="flex flex-col items-center gap-3 border-b border-white/10 px-4 py-6 sm:px-5">
              {!qrFailed && (
                <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/30">
                  <img
                    src={QR_SRC}
                    alt="QR code linking to the WebNest Studio digital card"
                    className="h-40 w-40"
                    width="160"
                    height="160"
                    loading="lazy"
                    onError={() => setQrFailed(true)}
                  />
                </div>
              )}
              <p className="text-center text-[0.68rem] text-ink-300">
                {qrFailed
                  ? 'Share or save this card using the buttons below.'
                  : 'Scan to open this card — or share it below'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {!qrFailed && (
                  <button
                    type="button"
                    onClick={downloadQr}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-[0.72rem] font-semibold text-ink-200 transition-colors hover:border-gold-300/50 hover:text-gold-200"
                  >
                    <FiDownload className="h-3.5 w-3.5" />
                    Download QR
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-[0.72rem] font-semibold text-ink-200 transition-colors hover:border-gold-300/50 hover:text-gold-200"
                >
                  <FiShare2 className="h-3.5 w-3.5" />
                  {shared ? 'Link copied' : 'Share card'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 p-4 sm:p-5">
              {ACTIONS.map((action) => {
                const Icon = action.icon
                const inner = (
                  <>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        action.primary
                          ? 'bg-ink-950/20 text-ink-950'
                          : 'bg-gold-400/10 text-gold-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-tight">{action.label}</span>
                      <span
                        className={`block truncate text-[0.68rem] ${
                          action.primary ? 'text-ink-950/70' : 'text-ink-300'
                        }`}
                      >
                        {action.hint}
                      </span>
                    </span>
                  </>
                )

                const className = `flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-transform hover:scale-[1.02] ${
                  action.primary
                    ? 'col-span-2 border-gold-300 bg-gold-400 text-ink-950'
                    : 'border-white/10 bg-white/[0.03] hover:border-gold-300/40'
                }`

                if (action.onClick) {
                  return (
                    <button key={action.key} type="button" onClick={action.onClick} className={className}>
                      {inner}
                    </button>
                  )
                }

                return (
                  <a
                    key={action.key}
                    href={action.href}
                    className={className}
                    {...(action.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {inner}
                  </a>
                )
              })}
            </div>

            {/* Consultation CTA */}
            <div className="px-4 pb-4 sm:px-5">
              <Link
                to="/contact"
                className="flex items-center justify-between gap-3 rounded-2xl border border-gold-300/30 bg-gold-400/10 px-4 py-3.5 transition-colors hover:border-gold-300/60"
              >
                <span>
                  <span className="block text-sm font-bold text-gold-200">Book a free consultation</span>
                  <span className="block text-[0.68rem] text-ink-300">15 minutes, no obligation</span>
                </span>
                <FiArrowRight className="h-4 w-4 shrink-0 text-gold-300" />
              </Link>
            </div>

            {/* Newsletter */}
            <div className="border-t border-white/10 px-4 py-5 sm:px-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold-300/90">
                Stay updated
              </p>
              <p className="mt-1.5 text-xs text-ink-300">
                Occasional notes on web, AI, and engineering — no spam.
              </p>
              <div className="mt-3">
                <NewsletterForm source="digital_card" />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-4 text-center">
              <Link to="/" className="text-[0.68rem] text-ink-400 transition-colors hover:text-gold-300">
                webneststudio.co.in
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
