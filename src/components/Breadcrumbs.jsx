import { Link } from 'react-router-dom'
import { useStructuredData } from '../hooks/useSeo'
import { breadcrumbSchema } from '../lib/seo'

export default function Breadcrumbs({ items }) {
  useStructuredData(breadcrumbSchema(items))
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-500 dark:text-ink-300">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.to} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <Link className="hover:underline" to={item.to}>{item.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
