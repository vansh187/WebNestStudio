import { Suspense, useEffect, useRef, useState } from 'react'
import { lazyWithReload } from '../lib/chunkReload'
import { NavLink, Link } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi'
import Logo from './Logo'
import { NAV_LINKS } from '../data/site'
import { useAuth } from '../context/AuthContext'

// Pulls in the card UI + newsletter form - only loaded once a visitor opens it.
const VisitingCardModal = lazyWithReload(() => import('./VisitingCardModal'))

// The "Visiting Card" entry opens an in-site overlay instead of navigating, so
// visitors can grab our details without leaving the page. The /card route still
// works for QR scans and shared links.
const CARD_PATH = '/card'

// Desktop links: a gold underline grows from the centre on hover and stays on the active page.
const DESKTOP_LINK = 'relative whitespace-nowrap py-2 text-sm font-medium tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:bg-gold-400 after:transition-transform after:duration-300'
const DESKTOP_LINK_ACTIVE = 'text-gold-400 after:scale-x-100'
const DESKTOP_LINK_IDLE = 'text-ink-100 hover:text-gold-300 after:scale-x-0 hover:after:scale-x-100'

function accountHome(role) {
  if (role === 'admin') return { to: '/admin', label: 'Admin' }
  return { to: '/portal', label: 'Profile' }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  // Latch: mount the modal on first open and keep it mounted so its
  // close animation can play out instead of being cut off by unmount.
  const [cardMounted, setCardMounted] = useState(false)
  const openCard = () => { setCardMounted(true); setCardOpen(true) }
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

  // Close the account menu on a click outside it or on Escape.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointer = (event) => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false) }
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    // A floating capsule. The header keeps a fixed height (h-22) so a page can pull its
    // hero up underneath with -mt-22; the open mobile menu overlays the page instead.
    <header className="sticky top-0 z-50 h-22 px-3 pt-3 sm:px-5">
      {/* The "dark" class keeps the capsule black with light text in both themes. */}
      <div
        className={`dark mx-auto max-w-7xl rounded-2xl border border-gold-400/30 bg-gradient-to-b from-ink-800/95 to-ink-950/95 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-2xl shadow-black/40' : 'shadow-xl shadow-black/20'
        }`}
      >
      <nav className="flex items-center justify-between px-5 py-3 lg:px-7">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size="md" />
        </Link>

        <div className="hidden items-center gap-6 xl:flex 2xl:gap-8">
          {NAV_LINKS.map((link) =>
            link.to === CARD_PATH ? (
              <button
                key={link.to}
                type="button"
                onClick={openCard}
                className={`${DESKTOP_LINK} ${DESKTOP_LINK_IDLE}`}
              >
                {link.label}
              </button>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `${DESKTOP_LINK} ${isActive ? DESKTOP_LINK_ACTIVE : DESKTOP_LINK_IDLE}`}
              >
                {link.label}
              </NavLink>
            ),
          )}
          <NavLink
            to="/contact"
            className={({ isActive }) => `${DESKTOP_LINK} ${isActive ? DESKTOP_LINK_ACTIVE : DESKTOP_LINK_IDLE}`}
          >
            Contact
          </NavLink>
        </div>

        <div className="hidden items-center gap-6 xl:flex 2xl:gap-8">
          {account ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-gold-400/60 px-4 py-2 text-sm font-semibold text-gold-300 hover:border-gold-400 transition-colors"
              >
                <FiUser className="h-4 w-4" />
                <span className="max-w-[9rem] truncate">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-950">
                  <Link
                    to={account.to}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-gold-500 dark:text-ink-100 dark:hover:bg-ink-900"
                  >
                    <FiUser className="h-4 w-4" /> {account.label}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-red-500 dark:text-ink-100 dark:hover:bg-ink-900"
                  >
                    <FiLogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-gold-400/60 px-5 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950"
            >
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 xl:hidden">
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
        <div className="xl:hidden border-t border-gold-400/20 px-6 py-4">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) =>
              link.to === CARD_PATH ? (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => { setOpen(false); openCard() }}
                  className="text-left text-base font-medium text-ink-700 dark:text-ink-100"
                >
                  {link.label}
                </button>
              ) : (
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
              ),
            )}
            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-base font-medium ${isActive ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'}`
              }
            >
              Contact
            </NavLink>
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
          </div>
        </div>
      )}
      </div>

      {cardMounted && (
        <Suspense fallback={null}>
          <VisitingCardModal open={cardOpen} onClose={() => setCardOpen(false)} />
        </Suspense>
      )}
    </header>
  )
}
