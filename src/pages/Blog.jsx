import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { SkeletonGrid } from '../components/states/Skeleton'
import { ErrorState, EmptyState } from '../components/states/StateViews'
import ResourceDownloadForm from '../components/forms/ResourceDownloadForm'
import NewsletterForm from '../components/forms/NewsletterForm'
import { getBlogPosts } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = searchParams.get('tag') || ''
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setPosts(null)
    setError(null)
    getBlogPosts(tag || undefined)
      .then((data) => { if (!cancelled) setPosts(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load the blog right now.')) })
    return () => { cancelled = true }
  }, [tag, reloadKey])

  const allTags = [...new Set((posts || []).flatMap((p) => p.tags || []))]

  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Insights
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Notes on web, AI, and engineering.
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {tag && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold-400/10 px-4 py-1.5 text-xs font-semibold text-gold-500"
              >
                Tag: {tag} ✕
              </button>
            )}

            {posts === null && !error && <SkeletonGrid count={4} columns="sm:grid-cols-1" />}
            {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
            {posts && posts.length === 0 && (
              <EmptyState title="No posts yet" description="We're working on our first articles — check back soon." />
            )}
            {posts && posts.length > 0 && (
              <div className="space-y-6">
                {posts.map((p, i) => (
                  <Reveal key={p.id ?? p.slug} delay={i * 0.06}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="group flex flex-col gap-5 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 transition-all hover:-translate-y-1 hover:border-gold-400/60 sm:flex-row"
                    >
                      {p.cover_image_url && (
                        <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800 sm:w-56">
                          <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          {(p.tags || []).map((t) => (
                            <span key={t} className="rounded-full bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-500">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 dark:text-white">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                          {p.excerpt}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-500">
                          Read more <FiArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {allTags.length > 0 && (
              <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
                <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
                  Browse by Topic
                </h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSearchParams({ tag: t })}
                      className="rounded-full border border-ink-200 dark:border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:border-gold-400 hover:text-gold-500 dark:text-ink-200"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
                Free Whitepaper
              </h4>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                Get our 2026 Web Dev Trends guide sent straight to your inbox.
              </p>
              <div className="mt-4">
                <ResourceDownloadForm resourceName="2026 Web Dev Trends Whitepaper" />
              </div>
            </div>

            <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
                Newsletter
              </h4>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                New articles, straight to your inbox.
              </p>
              <div className="mt-4">
                <NewsletterForm source="blog_sidebar" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
