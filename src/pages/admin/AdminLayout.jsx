import { useEffect, useRef } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { FiUsers, FiLayers, FiImage, FiMessageSquare, FiHelpCircle, FiEdit3, FiActivity, FiLogOut, FiArrowLeft, FiCheckSquare, FiAward } from 'react-icons/fi'
import Logo from '../../components/Logo'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin/leads', label: 'Leads', icon: FiUsers },
  { to: '/admin/services', label: 'Services', icon: FiLayers },
  { to: '/admin/portfolio', label: 'Portfolio', icon: FiImage },
  { to: '/admin/testimonials', label: 'Testimonials', icon: FiMessageSquare },
  { to: '/admin/faqs', label: 'FAQs', icon: FiHelpCircle },
  { to: '/admin/blog', label: 'Blog', icon: FiEdit3 },
  { to: '/admin/project-status', label: 'Project Status', icon: FiActivity },
  { to: '/admin/exam-bank', label: 'Exam Questions', icon: FiCheckSquare },
  { to: '/admin/certificates', label: 'Certificates', icon: FiAward },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navRef = useRef(null)

  // On phones the sections are a row that scrolls sideways: keep the open one in view.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-white text-ink-900 dark:bg-ink-950 dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
        <aside className="w-full min-w-0 shrink-0 lg:w-64">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Logo size="sm" />
            <div className="flex shrink-0 items-center gap-1 lg:hidden">
              <Link to="/" aria-label="Back to site" title="Back to site" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:text-gold-500 dark:text-ink-300">
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <button type="button" onClick={logout} aria-label="Log out" title="Log out" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:text-red-500 dark:text-ink-300">
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <Link
            to="/"
            className="mt-4 hidden min-h-11 items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-gold-500 dark:text-ink-300 dark:hover:text-gold-400 lg:inline-flex"
          >
            <FiArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <p className="mt-4 hidden text-xs font-semibold uppercase tracking-widest text-gold-500 lg:block">Admin</p>
          <nav ref={navRef} aria-label="Admin sections" className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors lg:gap-3 lg:whitespace-normal ${
                    isActive
                      ? 'bg-gold-400/10 text-gold-500'
                      : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 hidden border-t border-ink-200 dark:border-ink-800 pt-4 lg:block">
            <p className="text-xs text-ink-400">{user?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-red-500 dark:text-ink-300"
            >
              <FiLogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </aside>

        <main className="w-full min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
