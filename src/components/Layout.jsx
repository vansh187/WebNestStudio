import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from './aiBuilder/ChatWidget'
import { useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import { CONTACT } from '../data/site'

// Organization schema mounted once for every public page (Layout persists across
// route changes) - gives Google/AI answer engines a canonical entity to attach
// brand search results, knowledge panels, and business info to.
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  email: CONTACT.email,
  telephone: CONTACT.phone,
  sameAs: [CONTACT.instagramHref],
}

export default function Layout() {
  useStructuredData(ORGANIZATION_SCHEMA)

  return (
    <div className="min-h-screen bg-white text-ink-800 dark:bg-ink-950 dark:text-ink-100 transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
