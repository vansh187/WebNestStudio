import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiExternalLink, FiInfo, FiMinus } from 'react-icons/fi'
import Breadcrumbs from '../components/Breadcrumbs'
import { RelatedLearning } from '../components/RelatedLinks'
import {
  PAGE_PATH, PUBLISHED_ON, SPECS_CHECKED_ON, LAPTOPS, GUIDE, METHOD, FAQS, LEARNING_LINKS, affiliateUrl, AFFILIATE_REL,
} from '../data/laptops'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import { DEFAULT_IMAGE } from '../lib/seo'
import { trackEvent } from '../lib/analytics'

// Affiliate buying guide. The guide comes before the product cards on purpose: the
// page has to be useful on its own, with the links as a convenience. Same light
// template as CommercialService (no reveal animations), so the prerendered text is
// what visitors and crawlers see first.
const eyebrowClass = 'text-xs font-bold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-400'
const h2Class = 'font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl'
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950'

const TITLE = 'Best Laptops for Coding in India (16GB RAM, 512GB SSD)'
const DESCRIPTION = 'A practical guide to coding laptops in India with 16GB RAM and 512GB SSD: what specs matter, plus ASUS models compared from official spec sheets.'

const checkedOnLabel = new Date(`${SPECS_CHECKED_ON}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const formatRupees = (value) => `₹${value.toLocaleString('en-IN')}`

function AffiliateLink({ laptop, className, children }) {
  return (
    <a
      href={affiliateUrl(laptop.productUrl)}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() => trackEvent('affiliate_click', { source: laptop.id, page: PAGE_PATH })}
      className={className}
    >
      {children}
      <span className="sr-only"> (opens ASUS India in a new tab)</span>
    </a>
  )
}

function Disclosure() {
  return (
    <aside aria-label="Affiliate disclosure" className="flex gap-3 rounded-xl border border-gold-400/40 bg-gold-400/10 p-4 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
      <FiInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
      <p>
        <strong className="font-semibold text-ink-900 dark:text-white">Affiliate disclosure:</strong> links to ASUS on this page are affiliate links.
        If you buy through them, WebNest Studio may earn a commission at no extra cost to you. It does not change which laptops we list or what we say about them.
        See our <Link to="/disclaimer#affiliate-links" className={`font-semibold text-gold-600 underline dark:text-gold-400 ${focusRing}`}>disclaimer</Link>.
      </p>
    </aside>
  )
}

function PriceLine({ priceBand }) {
  if (!priceBand) {
    return <p className="text-sm text-ink-500 dark:text-ink-300">Prices change often, so we do not quote one. Check today&apos;s price on ASUS.</p>
  }
  const checked = new Date(`${priceBand.checkedOn}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return (
    <p className="text-sm text-ink-500 dark:text-ink-300">
      <span className="font-semibold text-ink-900 dark:text-white">{formatRupees(priceBand.min)}–{formatRupees(priceBand.max)}</span> on ASUS India (checked {checked})
    </p>
  )
}

const SPEC_ROWS = [
  ['processor', 'Processor'], ['memory', 'Memory'], ['storage', 'Storage'], ['graphics', 'Graphics'],
  ['display', 'Display'], ['battery', 'Battery'], ['weight', 'Weight'], ['ports', 'Ports'], ['charging', 'Charger'],
]

function LaptopCard({ laptop, rank }) {
  const headingId = `${laptop.id}-title`
  return (
    <article id={laptop.id} aria-labelledby={headingId} className="scroll-mt-24 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40 sm:p-8">
      <p className={eyebrowClass}>{String(rank).padStart(2, '0')} · {laptop.bestFor}</p>
      <h3 id={headingId} className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        {laptop.name} <span className="text-base font-semibold text-ink-500 dark:text-ink-300">({laptop.modelCode})</span>
      </h3>
      <p className="mt-3 leading-relaxed">{laptop.summary}</p>

      <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-ink-200 pt-5 text-sm dark:border-ink-800 sm:grid-cols-2">
        {SPEC_ROWS.map(([key, label]) => (
          <div key={key}>
            <dt className="font-semibold text-ink-900 dark:text-white">{label}</dt>
            <dd className="mt-0.5 text-ink-600 dark:text-ink-300">{laptop.specs[key]}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="font-semibold text-ink-900 dark:text-white">Good for coding</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {laptop.pros.map((item) => (
              <li key={item} className="flex gap-2"><FiCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-ink-900 dark:text-white">Keep in mind</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {laptop.cons.map((item) => (
              <li key={item} className="flex gap-2"><FiMinus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-ink-200 pt-5 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
        <PriceLine priceBand={laptop.priceBand} />
        <AffiliateLink
          laptop={laptop}
          className={`inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105 ${focusRing}`}
        >
          Check price on ASUS <FiExternalLink aria-hidden="true" className="h-4 w-4" />
        </AffiliateLink>
      </div>
    </article>
  )
}

export default function BestLaptops() {
  useSeo({ title: TITLE, description: DESCRIPTION, path: PAGE_PATH, type: 'article' })
  const schema = useMemo(() => ({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, image: [DEFAULT_IMAGE],
    datePublished: PUBLISHED_ON, dateModified: SPECS_CHECKED_ON,
    author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/authors/webnest-studio` },
    publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
  }), [])
  useStructuredData(schema)

  return (
    <article className="text-ink-700 dark:text-ink-200">
      <header className="border-b border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/30">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Best laptops for coding', to: PAGE_PATH }]} />
          <p className={eyebrowClass}>Buying guide</p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-5xl">{TITLE}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed">
            16GB of RAM and a 512GB SSD is the configuration we recommend to most people learning or working in software. It runs an IDE, a browser,
            a local server and a database at the same time without slowing to a crawl, and it costs far less than a 32GB machine.
            This guide explains what actually matters in a coding laptop, then compares {LAPTOPS.length} ASUS models sold in India that meet that bar.
          </p>
          <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
            By <Link to="/authors/webnest-studio" className={`font-semibold text-ink-700 underline dark:text-ink-100 ${focusRing}`}>WebNest Studio</Link> · Specifications checked against ASUS India on {checkedOnLabel}
          </p>
          <div className="mt-6 max-w-3xl"><Disclosure /></div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        <section aria-labelledby="quick-picks">
          <h2 id="quick-picks" className={h2Class}>Quick picks</h2>
          <p className="mt-3 max-w-3xl">Every model below has 16GB of RAM and a 512GB NVMe SSD. Tap a name to jump to its full specification.</p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-ink-200 dark:border-ink-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Comparison of the laptops on this page</caption>
              <thead className="bg-ink-50 text-ink-900 dark:bg-ink-900/60 dark:text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Laptop</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Best for</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Processor</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Weight</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Battery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {LAPTOPS.map((laptop) => (
                  <tr key={laptop.id}>
                    <th scope="row" className="px-4 py-3 font-semibold">
                      <a href={`#${laptop.id}`} className={`text-gold-600 underline dark:text-gold-400 ${focusRing}`}>{laptop.name}</a>
                      <span className="block text-xs font-normal text-ink-500 dark:text-ink-300">{laptop.modelCode}</span>
                    </th>
                    <td className="px-4 py-3">{laptop.bestFor}</td>
                    <td className="px-4 py-3">{laptop.specs.processor.replace(/ \([^()]*\)$/, '')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{laptop.specs.weight}</td>
                    <td className="px-4 py-3">{laptop.specs.battery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="what-matters">
          <h2 id="what-matters" className={h2Class}>What a coding laptop actually needs</h2>
          <nav aria-label="Guide sections" className="mt-5">
            <ul className="flex flex-wrap gap-2">
              {GUIDE.map((part) => (
                <li key={part.id}>
                  <a href={`#${part.id}`} className={`inline-flex rounded-full border border-ink-200 px-3 py-1.5 text-sm hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:hover:text-gold-400 ${focusRing}`}>{part.heading}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 space-y-10">
            {GUIDE.map((part) => (
              <div key={part.id} id={part.id} className="scroll-mt-24 max-w-3xl">
                <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{part.heading}</h3>
                <div className="mt-3 space-y-3 leading-relaxed">
                  {part.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="laptops">
          <h2 id="laptops" className={h2Class}>The laptops</h2>
          <p className="mt-3 max-w-3xl">
            Specifications are for the exact model code shown, as listed by ASUS India. The same laptop name is often sold in several configurations,
            so match the model code on the ASUS page before you buy.
          </p>
          <div className="mt-8 space-y-8">
            {LAPTOPS.map((laptop, index) => <LaptopCard key={laptop.id} laptop={laptop} rank={index + 1} />)}
          </div>
        </section>

        <section aria-labelledby="how-we-chose">
          <h2 id="how-we-chose" className={h2Class}>How we chose these laptops</h2>
          <ul className="mt-5 max-w-3xl space-y-3 leading-relaxed">
            {METHOD.map((item) => (
              <li key={item} className="flex gap-2"><FiCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-gold-500" />{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq" className={h2Class}>Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-ink-200 border-y border-ink-200 dark:divide-ink-800 dark:border-ink-800">
            {FAQS.map(([question, answer]) => (
              <div key={question} className="py-5">
                <h3 className="font-semibold text-ink-900 dark:text-white">{question}</h3>
                <p className="mt-2 max-w-3xl leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLearning
          links={LEARNING_LINKS}
          heading="Start coding on your new laptop"
          text="Our free courses and online playground work in any browser, so you can start learning the day your laptop arrives."
        />

        <Disclosure />
      </div>
    </article>
  )
}
