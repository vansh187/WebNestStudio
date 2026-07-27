import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { FiArrowLeft } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { Skeleton } from '../components/states/Skeleton'
import { ErrorState, NotFoundState } from '../components/states/StateViews'
import { getBlogPostBySlug } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'
import { FALLBACK_POSTS } from '../data/blogContent'
import { useSeo, useStructuredData, SITE_NAME } from '../hooks/useSeo'

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => <h2 className="mt-10 mb-4 font-display text-2xl font-bold text-ink-900 dark:text-white">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 mb-4 font-display text-2xl font-bold text-ink-900 dark:text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink-900 dark:text-white">{children}</h3>,
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink-900 dark:text-white">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-500 hover:underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-gold-400/60 pl-4 italic text-ink-500 dark:text-ink-300">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm dark:bg-ink-800">{children}</code>
  ),
  // Fenced code blocks nest <code> inside <pre> - reset the inline pill styling
  // there so a multi-line snippet reads as one block instead of a run of pills.
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-ink-100 p-4 text-sm dark:bg-ink-800 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
}

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
          const fallback = FALLBACK_POSTS.find((p) => p.slug === slug)
          if (fallback) {
            setPost(fallback)
            setState('success')
          } else {
            setState('not-found')
          }
        } else {
          setError(getErrorDetail(err, 'Could not load this post.'))
          setState('error')
        }
      })
    return () => { cancelled = true }
  }, [slug, reloadKey])

  const livePost = state === 'success' ? post : null
  useSeo({
    title: livePost?.meta_title || livePost?.title,
    description: livePost?.meta_description || livePost?.excerpt,
    path: `/blog/${slug}`,
    image: livePost?.cover_image_url,
    type: 'article',
    keywords: livePost?.keywords,
  })
  // Injects BlogPosting structured data so search engines can better understand
  // authorship and publish dates — part of the E-E-A-T signals Google's ranking
  // systems weigh for article content. Memoized on livePost so the <script> tag
  // isn't torn down and rebuilt on every unrelated re-render.
  const blogSchema = useMemo(() => livePost && {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: livePost.title,
    description: livePost.excerpt,
    datePublished: livePost.published_at,
    dateModified: livePost.updated_at || livePost.published_at,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    keywords: (livePost.tags || []).join(', '),
  }, [livePost])
  useStructuredData(blogSchema)

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
        {post.topic_tag && (
          <span className="mt-8 inline-flex items-center rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:border-ink-700 dark:text-ink-300">
            {post.topic_tag}
          </span>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
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
        {(post.published_at || post.word_count != null) && (
          <p className="mt-3 text-sm text-ink-400">
            {post.published_at &&
              new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            {post.published_at && post.word_count != null ? ' · ' : ''}
            {post.word_count != null && `${Math.max(1, Math.round(post.word_count / 200))} min read`}
          </p>
        )}

        {post.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
            <img src={post.cover_image_url} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        <div className="mt-8 text-lg text-ink-700 dark:text-ink-200">
          <ReactMarkdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkBreaks]}>{post.content}</ReactMarkdown>
        </div>
      </Reveal>
    </div>
  )
}
