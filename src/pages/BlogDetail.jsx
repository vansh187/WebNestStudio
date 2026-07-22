import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { Skeleton } from '../components/states/Skeleton'
import { ErrorState, NotFoundState } from '../components/states/StateViews'
import { getBlogPostBySlug } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'

export default function BlogDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState('loading')
    getBlogPostBySlug(slug)
      .then((data) => { if (!cancelled) { setPost(data); setState('success') } })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) {
          setState('not-found')
        } else {
          setError(getErrorDetail(err, 'Could not load this post.'))
          setState('error')
        }
      })
    return () => { cancelled = true }
  }, [slug, reloadKey])

  if (state === 'not-found') {
    return (
      <NotFoundState
        title="Post not found"
        description="This article may have been moved or is no longer available."
        backTo="/blog"
        backLabel="Back to blog"
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
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-64 w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-500 hover:underline">
        <FiArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <Reveal>
        <div className="mt-8 flex flex-wrap gap-2">
          {(post.tags || []).map((t) => (
            <Link
              key={t}
              to={`/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-500"
            >
              {t}
            </Link>
          ))}
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-3 text-sm text-ink-400">
            {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {post.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
            <img src={post.cover_image_url} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        <div className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-ink-700 dark:text-ink-200">
          {post.content}
        </div>
      </Reveal>
    </div>
  )
}
