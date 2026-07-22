import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiMenu, FiX, FiArrowRight, FiUser, FiLogOut } from 'react-icons/fi'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { NAV_LINKS } from '../data/site'
import { useAuth } from '../context/AuthContext'

function accountHome(role) {
  if (role === 'admin') return { to: '/admin', label: 'Admin' }
  return { to: '/portal', label: 'Portal' }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const account = isAuthenticated ? accountHome(user?.role) : null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-ink-950/80 backdrop-blur-lg border-b border-ink-200/60 dark:border-ink-800/60'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size="md" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-gold-500'
                    : 'text-ink-600 dark:text-ink-200 hover:text-gold-500 dark:hover:text-gold-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle />
          {account ? (
            <>
              <Link
                to={account.to}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
              >
                <FiUser className="h-4 w-4" /> {account.label}
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-ink-600 dark:text-ink-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
            >
              Login
            </Link>
          )}
          <Link
            to="/contact"
            className="group inline-flex items-center gap-1.5 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-105"
          >
            Start a Project
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100"
          >
            {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-6 py-4">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium ${
                    isActive ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {account ? (
              <>
                <Link
                  to={account.to}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink-700 dark:text-ink-100"
                >
                  {account.label}
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setOpen(false) }}
                  className="text-left text-base font-medium text-ink-700 dark:text-ink-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-base font-medium text-ink-700 dark:text-ink-100"
              >
                Login
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-3 text-sm font-semibold text-white dark:text-ink-950"
            >
              Start a Project
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
