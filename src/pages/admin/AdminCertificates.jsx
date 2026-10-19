import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiLoader, FiSearch } from 'react-icons/fi'
import { useToast } from '../../context/ToastContext'
import { getErrorDetail } from '../../lib/apiClient'
import { formatDate } from '../../lib/examTime'
import { listAdminCertificates, reissueCertificate, revokeCertificate } from '../../api/admin'

// Every issued certificate: who completed which course, with ID, score and status. Admins
// revoke (misconduct) or reissue (a name correction gets a new ID; the old one is revoked).

const BTN = 'rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold hover:border-gold-400 dark:border-ink-700'

export default function AdminCertificates() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async (q) => {
    setItems(null)
    setError('')
    try {
      const data = await listAdminCertificates(q || undefined)
      setItems(Array.isArray(data) ? data : (data?.items ?? []))
    } catch (err) {
      setError(getErrorDetail(err, 'Could not load certificates.'))
      setItems([])
    }
  }, [])

  useEffect(() => { load('') }, [load])

  const revoke = async (cert) => {
    const reason = window.prompt(`Revoke ${cert.certificate_id}? Give a reason (kept on record).`)
    if (!reason?.trim()) return
    try {
      await revokeCertificate(cert.certificate_id, reason.trim())
      toast.success('Certificate revoked.')
      load(query)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not revoke the certificate.'))
    }
  }

  const reissue = async (cert) => {
    const name = window.prompt('Corrected name for the new certificate:', cert.recipient_name)
    if (!name?.trim() || name.trim() === cert.recipient_name) return
    try {
      const next = await reissueCertificate(cert.certificate_id, name.trim())
      toast.success(`Reissued as ${next?.certificate_id ?? 'a new certificate'}.`)
      load(query)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not reissue the certificate.'))
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Certificates</h2>
      <form onSubmit={(event) => { event.preventDefault(); load(query.trim()) }} className="mt-4 flex gap-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by ID, name, email or course" aria-label="Search certificates" className="w-full max-w-md rounded-lg border border-ink-200 bg-transparent px-3 py-2 text-sm dark:border-ink-700" />
        <button type="submit" className={BTN}><FiSearch className="inline" /> Search</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {items === null ? (
        <div className="mt-6 flex justify-center"><FiLoader className="h-5 w-5 animate-spin text-gold-500" /></div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">No certificates found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs text-ink-500"><th className="py-2">Certificate ID</th><th>Name</th><th>Email</th><th>Course</th><th>Score</th><th>Issued</th><th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((cert) => (
                <tr key={cert.certificate_id} className="border-t border-ink-100 dark:border-ink-800">
                  <td className="py-2 font-mono text-xs"><Link to={`/certificates/${cert.certificate_id}`} className="hover:text-gold-600">{cert.certificate_id}</Link></td>
                  <td>{cert.recipient_name}</td>
                  <td className="text-ink-500">{cert.user_email}</td>
                  <td>{cert.course_title}</td>
                  <td className="tabular-nums">{cert.score}/{cert.total ?? 30}</td>
                  <td>{formatDate(cert.issued_at)}</td>
                  <td className={cert.status === 'revoked' ? 'text-red-600' : 'text-emerald-600'} title={cert.revoked_reason || undefined}>{cert.status}</td>
                  <td className="whitespace-nowrap">
                    {cert.status === 'valid' && (
                      <span className="flex gap-1">
                        <button type="button" onClick={() => reissue(cert)} className={BTN}>Reissue</button>
                        <button type="button" onClick={() => revoke(cert)} className={`${BTN} text-red-600`}>Revoke</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
