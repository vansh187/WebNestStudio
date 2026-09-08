import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiExternalLink } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo'
import CodeEditor from '../../components/coding/CodeEditor'
import OutputPanel from '../../components/coding/OutputPanel'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { getLanguage } from '../../data/codingLanguages'
import { getShare } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'

const STORAGE_KEY = 'wns-playground'

export default function SharedSnippet() {
  const { shareId } = useParams()
  const navigate = useNavigate()

  const [snapshot, setSnapshot] = useState(undefined) // undefined = loading, null = not found
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useSeo({
    title: snapshot?.title ? `${snapshot.title} — Shared code` : 'Shared code',
    description: snapshot
      ? `A shared ${getLanguage(snapshot.language)?.label ?? snapshot.language} snippet on WebNest Studio.`
      : undefined,
    path: `/s/${shareId}`,
  })

  useEffect(() => {
    let cancelled = false
    setSnapshot(undefined)
    setError(null)
    getShare(shareId)
      .then((data) => {
        if (!cancelled) setSnapshot(data)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) setSnapshot(null)
        else setError(getErrorDetail(err, 'Could not load this shared snippet.'))
      })
    return () => {
      cancelled = true
    }
  }, [shareId, reloadKey])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      </div>
    )
  }

  if (snapshot === null) {
    return (
      <NotFoundState
        title="Shared snippet not found"
        description="This link may be wrong, or the snippet was removed."
      />
    )
  }

  if (snapshot === undefined) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-[50dvh] w-full" />
      </div>
    )
  }

  const lang = getLanguage(snapshot.language)
  const source = snapshot.files?.[0]?.content ?? snapshot.source ?? ''

  const openInPlayground = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ language: snapshot.language, source, stdin: snapshot.stdin ?? '' }),
      )
    } catch {
      /* private mode — Playground just opens with its own last session */
    }
    navigate('/playground')
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <BackButton fallback="/playground" className="mb-2" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Shared code</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white">
            {snapshot.title || 'Untitled snippet'}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {lang?.label ?? snapshot.language}
            {snapshot.created_at && <> · shared {new Date(snapshot.created_at).toLocaleDateString()}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={openInPlayground}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-gold-400 dark:text-ink-950"
        >
          <FiExternalLink className="h-4 w-4" /> Open in Playground
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]">
        <CodeEditor
          value={source}
          language={lang?.monacoId ?? 'plaintext'}
          readOnly
          className="h-[50dvh] min-h-[260px] lg:h-[60dvh] lg:max-h-[720px]"
        />
        <OutputPanel
          result={
            snapshot.stdout != null
              ? { status: 'success', stdout: snapshot.stdout, stderr: '', exit_code: 0 }
              : null
          }
          className="lg:h-[60dvh] lg:max-h-[720px] lg:overflow-auto"
        />
      </div>
    </div>
  )
}
