import { FiCheckCircle, FiCircle } from 'react-icons/fi'

const FIELD_LABELS = {
  project_type: 'Project type',
  project_goal: 'Goal',
  pages_features: 'Pages & features',
  budget_range: 'Budget range',
  timeline_expectation: 'Timeline',
}

function formatValue(value) {
  if (value == null) return null
  if (Array.isArray(value)) return value.length ? value.join(', ') : null
  return value
}

export default function CollectedFieldsCard({ fields }) {
  if (!fields) return null

  const entries = Object.entries(FIELD_LABELS).map(([key, label]) => ({
    key,
    label,
    value: formatValue(fields[key]),
  }))
  const filledCount = entries.filter((e) => e.value).length

  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-900/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Project details ({filledCount}/{entries.length})
      </p>
      <ul className="space-y-1.5">
        {entries.map((e) => (
          <li key={e.key} className="flex items-start gap-2 text-xs">
            {e.value ? (
              <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <FiCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300 dark:text-ink-600" />
            )}
            <span className={e.value ? 'text-ink-700 dark:text-ink-200' : 'text-ink-400'}>
              <span className="font-medium">{e.label}:</span> {e.value || 'not yet shared'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
