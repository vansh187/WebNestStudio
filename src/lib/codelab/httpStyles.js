// Colours for HTTP methods and status codes, shared by the API tester and the
// architecture trace.
export const METHOD_STYLES = {
  GET: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  POST: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PATCH: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export function statusTone(status) {
  if (!status) return 'border-red-500/30 bg-red-500/10 text-red-500'
  if (status < 300) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (status < 400) return 'border-sky-500/30 bg-sky-500/10 text-sky-600'
  if (status < 500) return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
  return 'border-red-500/30 bg-red-500/10 text-red-500'
}
