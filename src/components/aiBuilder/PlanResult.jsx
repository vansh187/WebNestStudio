import { useState } from 'react'
import { FiDownload, FiMail, FiLoader } from 'react-icons/fi'
import { downloadPlanPdf, emailPlan } from '../../api/chat'
import { getErrorDetail } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

export default function PlanResult({ plan }) {
  const toast = useToast()
  const { user } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  if (!plan) return null

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await downloadPlanPdf(plan.plan_id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'webnest-studio-plan.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getErrorDetail(error, 'Could not download the PDF right now.'))
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async () => {
    setEmailing(true)
    try {
      const target = emailInput.trim() || undefined
      const result = await emailPlan(plan.plan_id, target)
      // sent:false means delivery is disabled/misconfigured on the backend, not a
      // frontend bug - show a graceful fallback rather than an error, per the API guide.
      if (result.sent) {
        toast.success(`Plan emailed to ${target || user?.email || 'your account email'}.`)
      } else {
        toast.info("We'll email your plan shortly.")
      }
    } catch (error) {
      toast.error(getErrorDetail(error, 'Could not email the plan right now.'))
    } finally {
      setEmailing(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gold-400/30 bg-gold-400/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
        Your {plan.total_weeks}-Week Plan
      </p>

      {Array.isArray(plan.weeks) && plan.weeks.length > 0 && (
        <div className="space-y-2">
          {plan.weeks.map((w) => (
            <div key={w.week_range} className="rounded-lg bg-white/70 dark:bg-ink-900/60 p-2.5 text-xs">
              <p className="font-semibold text-ink-900 dark:text-white">{w.week_range} · {w.title}</p>
              <p className="mt-1 text-ink-500 dark:text-ink-300">{w.description}</p>
            </div>
          ))}
        </div>
      )}

      {plan.html_summary && (
        // Backend-generated branded fragment, pre-sanitized per CHATBOT_API.md - safe
        // to render directly, not user-controlled input.
        <div dangerouslySetInnerHTML={{ __html: plan.html_summary }} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-3.5 py-2 text-xs font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiDownload className="h-3.5 w-3.5" />}
          Download PDF
        </button>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={user?.email || 'you@company.com'}
          className="min-w-0 flex-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-2.5 py-2 text-xs text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleEmail}
          disabled={emailing}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 dark:border-ink-700 px-3.5 py-2 text-xs font-semibold text-ink-700 dark:text-ink-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {emailing ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiMail className="h-3.5 w-3.5" />}
          Email
        </button>
      </div>
    </div>
  )
}
