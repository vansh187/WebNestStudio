import { NavLink, Outlet } from 'react-router-dom'
import { FiUsers, FiLayers, FiImage, FiMessageSquare, FiHelpCircle, FiEdit3, FiActivity, FiLogOut } from 'react-icons/fi'
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
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white text-ink-900 dark:bg-ink-950 dark:text-white">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10 lg:px-8">
        <aside className="w-64 shrink-0">
          <Logo size="sm" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-500">Admin</p>
          <nav className="mt-4 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
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
          <div className="mt-8 border-t border-ink-200 dark:border-ink-800 pt-4">
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

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
