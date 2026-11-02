import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { lazyWithReload } from '../lib/chunkReload'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiSmartphone, FiZap } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import Logo from './Logo'
import { NAV_LINKS } from '../data/site'
import { useAuth } from '../context/AuthContext'
import { usePrime } from '../hooks/usePrime'
import PrimeBadge from './PrimeBadge'

// Pulls in the card UI + newsletter form - only loaded once a visitor opens it.
const VisitingCardModal = lazyWithReload(() => import('./VisitingCardModal'))

// The "Visiting Card" entry opens an in-site overlay instead of navigating, so
// visitors can grab our details without leaving the page. The /card route still
// works for QR scans and shared links.
const CARD_PATH = '/card'

// Always goes to the install page rather than the APK itself, so desktop and iPhone
// visitors get instructions instead of a file they can't install.
const APP_PATH = '/download-app'

// Desktop links: a gold underline grows from the centre on hover and stays on the active page.
const DESKTOP_LINK = 'relative whitespace-nowrap py-2 text-sm font-medium tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:bg-gold-400 after:transition-transform after:duration-300'
const DESKTOP_LINK_ACTIVE = 'text-gold-400 after:scale-x-100'
const DESKTOP_LINK_IDLE = 'text-ink-100 hover:text-gold-300 after:scale-x-0 hover:after:scale-x-100'

function accountHome(role) {
  if (role === 'admin') return { to: '/admin', label: 'Admin' }
  return { to: '/portal', label: 'Profile' }
}

// Closes a menu on a click outside it or on Escape.
function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => { if (!ref.current?.contains(event.target)) close() }
    const onKey = (event) => { if (event.key === 'Escape') close() }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, close])
}

function useGroupActive(items) {
  const { pathname } = useLocation()
  return items.some(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
}

function NewBadge({ label }) {
  return <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-ink-950">{label}</span>
}

// Hidden with CSS rather than left out, so the links stay in the HTML for search engines.
function DesktopGroup({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const active = useGroupActive(items)
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${DESKTOP_LINK} inline-flex items-center gap-1 ${active ? DESKTOP_LINK_ACTIVE : DESKTOP_LINK_IDLE}`}
      >
        {label}
        <FiChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div role="menu" className={`${open ? '' : 'hidden'} absolute left-0 mt-2 w-40 overflow-hidden rounded-xl border border-ink-800 bg-ink-950 py-1 shadow-lg`}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            role="menuitem"
            onClick={close}
            className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium hover:bg-ink-900 ${isActive ? 'text-gold-400' : 'text-ink-100 hover:text-gold-300'}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function MobileGroup({ label, items, onNavigate }) {
  const active = useGroupActive(items)
  const [open, setOpen] = useState(active)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between text-left text-base font-medium ${active ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'}`}
      >
        {label}
        <FiChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3 border-l border-gold-400/30 pl-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `text-base font-medium ${isActive ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useDismiss(menuRef, menuOpen, closeMenu)
  // Latch: mount the modal on first open and keep it mounted so its
  // close animation can play out instead of being cut off by unmount.
  const [cardMounted, setCardMounted] = useState(false)
  const openCard = () => { setCardMounted(true); setCardOpen(true) }
  const { isAuthenticated, user, logout } = useAuth()
  const account = isAuthenticated ? accountHome(user?.role) : null
  const prime = usePrime()

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
    // A floating capsule. The header keeps a fixed height (h-22) so a page can pull its
    // hero up underneath with -mt-22; the open mobile menu overlays the page instead.
    <header className="sticky top-0 z-50 h-22 px-3 pt-3 sm:px-5 print:hidden">
      {/* The "dark" class keeps the capsule black with light text in both themes. */}
      <div
        className={`dark mx-auto max-w-7xl rounded-2xl border border-gold-400/40 bg-gradient-to-b from-[#3a362f]/90 to-[#1f1d1a]/90 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-2xl shadow-black/40' : 'shadow-xl shadow-black/20'
        }`}
      >
      <nav className="flex items-center justify-between px-5 py-3 lg:px-7">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size="md" prime={prime.isPrime} />
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <DesktopGroup key={link.label} label={link.label} items={link.children} />
            ) : link.to === CARD_PATH ? (
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
                className={({ isActive }) => `${DESKTOP_LINK} inline-flex items-center gap-1.5 ${isActive ? DESKTOP_LINK_ACTIVE : DESKTOP_LINK_IDLE}`}
              >
                {link.label}
                {link.badge && <NewBadge label={link.badge} />}
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

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to={APP_PATH}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-300"
          >
            <FiSmartphone className="h-4 w-4" /> Get App
          </Link>
          {account ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-gold-400/60 px-4 py-2 text-sm font-semibold text-gold-300 hover:border-gold-400 transition-colors"
              >
                {/* The bar has no room for the full label, which the menu below shows. */}
                {prime.isPrime ? <FaCrown className="h-4 w-4" title={prime.label} /> : <FiUser className="h-4 w-4" />}
                <span className="max-w-[5rem] truncate">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-950">
                  {prime.isPrime && <div className="px-4 py-2"><PrimeBadge label={prime.label} /></div>}
                  {prime.isPrime && (
                    <Link
                      to="/ai-agent"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-gold-500 dark:text-ink-100 dark:hover:bg-ink-900"
                    >
                      <FiZap className="h-4 w-4" /> AI Agent
                    </Link>
                  )}
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

        <div className="flex items-center gap-2 sm:gap-3 xl:hidden">
          {account && (
            <Link
              to={account.to}
              aria-label={account.label}
              title={account.label}
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/60 text-gold-300"
            >
              {prime.isPrime ? <FaCrown className="h-5 w-5" title={prime.label} /> : <FiUser className="h-5 w-5" />}
            </Link>
          )}
          <Link
            to={APP_PATH}
            aria-label="Get the Android app"
            title="Get the Android app"
            onClick={() => setOpen(false)}
            className={`${account ? 'hidden sm:flex' : 'flex'} h-10 w-10 items-center justify-center rounded-full bg-gold-400 text-ink-950 transition-colors hover:bg-gold-300`}
          >
            <FiSmartphone className="h-5 w-5" />
          </Link>
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
        <div className="xl:hidden max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-gold-400/20 px-6 py-4">
          {account && (
            <div className="mb-4 rounded-xl border border-gold-400/30 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-gold-300">
                <FiUser className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{user?.full_name || 'My account'}</span>
              </p>
              {user?.email && <p className="mt-0.5 truncate text-xs text-ink-300">{user.email}</p>}
              {prime.isPrime && <PrimeBadge label={prime.label} className="mt-2" />}
              {prime.isPrime && (
                <Link
                  to="/ai-agent"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gold-400/40 text-sm font-semibold text-gold-300"
                >
                  <FiZap className="h-4 w-4" /> Open AI Agent
                </Link>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to={account.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gold-400 text-sm font-semibold text-ink-950"
                >
                  <FiUser className="h-4 w-4" /> {account.label}
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setOpen(false) }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gold-400/40 text-sm font-semibold text-ink-100"
                >
                  <FiLogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <MobileGroup key={link.label} label={link.label} items={link.children} onNavigate={() => setOpen(false)} />
              ) : link.to === CARD_PATH ? (
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
                    `inline-flex items-center gap-2 text-base font-medium ${
                      isActive ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'
                    }`
                  }
                >
                  {link.label}
                  {link.badge && <NewBadge label={link.badge} />}
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
            <NavLink
              to={APP_PATH}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 text-base font-medium ${isActive ? 'text-gold-500' : 'text-ink-700 dark:text-ink-100'}`
              }
            >
              <FiSmartphone className="h-4 w-4 text-gold-400" /> Get App
            </NavLink>
            {!account && (
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
