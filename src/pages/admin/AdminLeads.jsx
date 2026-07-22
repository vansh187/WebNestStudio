import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import { getLeads, updateLeadStatus } from '../../api/admin'
import { getErrorDetail } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'

const SOURCES = ['', 'contact_form', 'start_project', 'consultation_booking', 'resource_download', 'newsletter', 'chatbot']
const STATUSES = ['new', 'contacted', 'qualified', 'confirmed', 'completed', 'won', 'lost']
const LIMIT = 20

export default function AdminLeads() {
  const toast = useToast()
  const [source, setSource] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setError(null)
    getLeads({ source: source || undefined, status_filter: statusFilter || undefined, limit: LIMIT, offset })
      .then((data) => { if (!cancelled) setResult(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load leads.')) })
    return () => { cancelled = true }
  }, [source, statusFilter, offset, reloadKey])

  const handleStatusChange = async (lead, status) => {
    const previous = lead.status
    setResult((prev) => ({ ...prev, items: prev.items.map((l) => (l.id === lead.id ? { ...l, status } : l)) }))
    try {
      await updateLeadStatus(lead.id, status)
    } catch (err) {
      setResult((prev) => ({ ...prev, items: prev.items.map((l) => (l.id === lead.id ? { ...l, status: previous } : l)) }))
      toast.error(getErrorDetail(err, 'Could not update status.'))
    }
  }

  const total = result?.total ?? 0
  const page = Math.floor(offset / LIMIT) + 1
  const pageCount = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-ink-900 dark:text-white">Leads</h2>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={source}
          onChange={(e) => { setSource(e.target.value); setOffset(0) }}
          className="rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white"
        >
          {SOURCES.map((s) => <option key={s} value={s}>{s || 'All Sources'}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0) }}
          className="rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {result === null && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {result && result.items.length === 0 && <EmptyState title="No leads match these filters" />}
      {result && result.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900/60 text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((lead) => (
                  <tr key={lead.id} className="border-t border-ink-100 dark:border-ink-800">
                    <td className="px-4 py-3 text-ink-700 dark:text-ink-200">{lead.full_name}</td>
                    <td className="px-4 py-3 text-ink-700 dark:text-ink-200">{lead.email}</td>
                    <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{lead.source}</td>
                    <td className="px-4 py-3 text-ink-500 dark:text-ink-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        className="rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-2 py-1.5 text-xs font-semibold text-ink-900 dark:text-white"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
            <span>Page {page} of {pageCount} ({total} total)</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                className="rounded-lg border border-ink-200 dark:border-ink-700 p-2 disabled:opacity-40"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={offset + LIMIT >= total}
                onClick={() => setOffset((o) => o + LIMIT)}
                className="rounded-lg border border-ink-200 dark:border-ink-700 p-2 disabled:opacity-40"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
