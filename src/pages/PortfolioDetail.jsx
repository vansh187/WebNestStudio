import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { Skeleton } from '../components/states/Skeleton'
import { ErrorState, NotFoundState } from '../components/states/StateViews'
import { getPortfolioBySlug } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'

export default function PortfolioDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState('loading')
    getPortfolioBySlug(slug)
      .then((data) => { if (!cancelled) { setItem(data); setState('success') } })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) {
          setState('not-found')
        } else {
          setError(getErrorDetail(err, 'Could not load this project.'))
          setState('error')
        }
      })
    return () => { cancelled = true }
  }, [slug, reloadKey])

  if (state === 'not-found') {
    return (
      <NotFoundState
        title="Project not found"
        description="This case study may have been moved or is no longer available."
        backTo="/portfolio"
        backLabel="Back to our work"
      />
    )
  }

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-64 w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
      <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-500 hover:underline">
        <FiArrowLeft className="h-4 w-4" /> Back to our work
      </Link>

      <Reveal>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
          {item.category}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
          {item.title}
        </h1>
        {item.client_name && <p className="mt-2 text-ink-500 dark:text-ink-300">Client: {item.client_name}</p>}

        {item.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
            <img src={item.cover_image_url} alt={item.title} className="w-full object-cover" />
          </div>
        )}

        <p className="mt-8 text-lg leading-relaxed text-ink-600 dark:text-ink-200">
          {item.full_description || item.short_description}
        </p>

        {item.result_metrics && (
          <div className="mt-6 rounded-2xl border border-gold-400/30 bg-gold-400/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Results</p>
            <p className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              {item.result_metrics}
            </p>
          </div>
        )}

        {item.tech_stack?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {item.tech_stack.map((t) => (
              <span key={t} className="rounded-full border border-ink-200 dark:border-ink-700 px-3 py-1 text-xs font-semibold text-ink-600 dark:text-ink-200">
                {t}
              </span>
            ))}
          </div>
        )}

        {item.gallery_urls?.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {item.gallery_urls.map((url) => (
              <img key={url} src={url} alt="" className="rounded-xl border border-ink-200 dark:border-ink-800" />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-3xl bg-ink-900 dark:bg-gradient-to-br dark:from-ink-900 dark:to-ink-950 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Want something like this?</h2>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
          >
            Start Your Project
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
