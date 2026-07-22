import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { Skeleton } from '../components/states/Skeleton'
import { ErrorState } from '../components/states/StateViews'
import { getFaqs } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'
import { FALLBACK_FAQS } from '../data/faqContent'

// Injects FAQPage structured data so search engines can render rich-result snippets
// for these questions — a direct, measurable SEO lever beyond on-page copy alone.
function useFaqStructuredData(faqs) {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return undefined

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [faqs])
}

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display font-semibold text-ink-900 dark:text-white">{faq.question}</span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gold-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="px-6 pb-5 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{faq.answer}</p>
      )}
    </div>
  )
}

export default function Faqs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const [faqs, setFaqs] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setFaqs(null)
    setError(null)
    getFaqs(category || undefined)
      .then((data) => { if (!cancelled) setFaqs(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load FAQs right now.')) })
    return () => { cancelled = true }
  }, [category, reloadKey])

  // Live backend data wins once published; curated fallback content keeps the page
  // (and its SEO value) populated in the meantime rather than showing an empty state.
  const displayFaqs = faqs && faqs.length > 0 ? faqs : FALLBACK_FAQS
  const visibleFaqs = useMemo(
    () => (category ? displayFaqs.filter((f) => f.category === category) : displayFaqs),
    [displayFaqs, category]
  )
  const categories = [...new Set(displayFaqs.map((f) => f.category).filter(Boolean))]

  useFaqStructuredData(error ? null : visibleFaqs)

  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            FAQs
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Answers to common questions.
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${!category ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950' : 'border border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-300'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSearchParams({ category: c })}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${category === c ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950' : 'border border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-300'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {faqs === null && !error && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
        {faqs !== null && !error && (
          <div className="space-y-4">
            {visibleFaqs.map((faq) => <FaqItem key={faq.id} faq={faq} />)}
          </div>
        )}
      </section>
    </div>
  )
}
