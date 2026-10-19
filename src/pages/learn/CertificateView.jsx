import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiAlertTriangle, FiCheckCircle, FiCopy, FiDownload, FiLinkedin, FiLoader, FiPrinter } from 'react-icons/fi'
import Logo from '../../components/Logo'
import { useToast } from '../../context/ToastContext'
import { useSeo, SITE_NAME, SITE_URL } from '../../hooks/useSeo'
import { certificatePdfUrl, getCertificate } from '../../api/learning'
import { formatDate } from '../../lib/examTime'
import { NotFoundState } from '../../components/states/StateViews'

// Public page for one certificate: anyone with the ID (an employer, a LinkedIn visitor) can
// check it here. Shows only the name, course, date, ID and status. Printing it gives the
// certificate alone; the server PDF is the same design.

const BTN = 'inline-flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:text-ink-200'

// LinkedIn's "Add to profile" link for a certification.
function linkedInUrl(cert, url) {
  const issued = new Date(cert.issued_at)
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: `${cert.course_title} Certificate`,
    organizationName: SITE_NAME,
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: url,
    certId: cert.certificate_id,
  })
  return `https://www.linkedin.com/profile/add?${params}`
}

export default function CertificateView() {
  const { certificateId } = useParams()
  const toast = useToast()
  const [cert, setCert] = useState(undefined) // undefined = loading, null = not found
  const [error, setError] = useState(false)
  const pageUrl = `${SITE_URL}/certificates/${certificateId}`

  useSeo({
    title: cert ? `${cert.recipient_name} · ${cert.course_title} certificate` : 'Certificate verification',
    description: 'Verify a WebNest Studio course certificate.',
    path: `/certificates/${certificateId}`,
    noindex: true,
    ads: false,
  })

  useEffect(() => {
    let cancelled = false
    setCert(undefined)
    setError(false)
    getCertificate(certificateId)
      .then((data) => { if (!cancelled) setCert(data) })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) setCert(null)
        else setError(true)
      })
    return () => { cancelled = true }
  }, [certificateId])

  if (cert === null) {
    return <NotFoundState title="Certificate not found" description={`No certificate has the ID ${certificateId}. Check the ID and try again.`} backTo="/learn" backLabel="Browse courses" />
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700 dark:text-ink-200">
        <p>Could not check this certificate right now. Please try again in a moment.</p>
      </div>
    )
  }
  if (cert === undefined) {
    return <div className="flex min-h-[50vh] items-center justify-center"><FiLoader className="h-6 w-6 animate-spin text-gold-500" /></div>
  }

  const valid = cert.status === 'valid'
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      toast.success('Verification link copied.')
    } catch {
      toast.info(pageUrl)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm print:hidden ${valid ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300'}`} role="status">
        {valid ? <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
        {valid
          ? `Verified: this certificate was issued by ${SITE_NAME} on ${formatDate(cert.issued_at)}.`
          : 'This certificate has been revoked and is no longer valid.'}
      </div>

      <article aria-label="Certificate" className="certificate mt-5 rounded-2xl border-4 border-double border-gold-400 bg-white p-6 text-center text-ink-900 shadow-sm sm:p-12 print:mt-0 print:shadow-none">
        {/* The card is white in both themes, so the wordmark is not the theme-aware one. */}
        <div className="flex items-center justify-center gap-3">
          <Logo size="md" showText={false} />
          <span className="font-display text-lg font-semibold leading-none text-ink-900">WebNest <span className="text-gold-600">Studio</span></span>
        </div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">Certificate of completion</p>
        <p className="mt-6 text-sm text-ink-500">This certifies that</p>
        <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">{cert.recipient_name}</p>
        <p className="mt-4 text-sm text-ink-500">has completed the course and passed its final exam</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink-800">{cert.course_title}</p>
        <div className="mt-10 grid gap-4 text-sm text-ink-600 sm:grid-cols-2">
          <div><p className="text-xs uppercase tracking-widest text-ink-400">Issued</p><p className="mt-1 font-semibold">{formatDate(cert.issued_at)}</p></div>
          <div><p className="text-xs uppercase tracking-widest text-ink-400">Certificate ID</p><p className="mt-1 font-mono font-semibold">{cert.certificate_id}</p></div>
        </div>
        <p className="mt-8 break-all text-xs text-ink-400">Verify at {pageUrl}</p>
        {!valid && <p className="mt-4 text-sm font-bold uppercase tracking-widest text-red-600">Revoked</p>}
      </article>

      {valid && (
        <div className="mt-5 flex flex-wrap justify-center gap-2 print:hidden">
          <a href={certificatePdfUrl(cert.certificate_id)} className={BTN} download><FiDownload /> Download PDF</a>
          <button type="button" onClick={() => window.print()} className={BTN}><FiPrinter /> Print</button>
          <button type="button" onClick={copyLink} className={BTN}><FiCopy /> Copy link</button>
          <a href={linkedInUrl(cert, pageUrl)} target="_blank" rel="noopener noreferrer" className={BTN}><FiLinkedin /> Add to LinkedIn</a>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-ink-500 print:hidden">
        <Link to="/learn" className="font-semibold text-gold-600 hover:underline">Explore {SITE_NAME} courses</Link>
      </p>
    </div>
  )
}
