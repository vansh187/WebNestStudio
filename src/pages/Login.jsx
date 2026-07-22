import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import Logo from '../components/Logo'
import Reveal from '../components/Reveal'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center bg-white px-6 py-16 text-ink-800 dark:bg-ink-950 dark:text-ink-100">
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-gold-400/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[24rem] w-[24rem] rounded-full bg-gold-600/10 blur-[100px]" />
      <ThemeToggle className="absolute right-6 top-6" />

      <Reveal className="relative w-full max-w-md">
        <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="mt-8 text-center">
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              {mode === 'login'
                ? 'Sign in to track your project and collaborate with our team.'
                : 'Join WebNest Studio to start and follow your project.'}
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-gold-400/40 bg-gold-400/10 p-6 text-center">
              <p className="font-display font-semibold text-ink-900 dark:text-white">
                {mode === 'login' ? "You're signed in!" : 'Account created!'}
              </p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
                This is a preview flow — client portal access is coming soon.
              </p>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', password: '' }) }}
                className="mt-4 text-sm font-semibold text-gold-500 hover:underline"
              >
                Back to form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  Email Address
                </label>
                <div className="relative mt-2">
                  <FiMail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent py-3 pl-11 pr-4 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  Password
                </label>
                <div className="relative mt-2">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent py-3 pl-11 pr-11 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-gold-500"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm font-medium text-gold-500 hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02]"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-300">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setSubmitted(false) }}
              className="font-semibold text-gold-500 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-ink-400 dark:text-ink-500">
          <Link to="/" className="hover:text-gold-500">← Back to homepage</Link>
        </p>
      </Reveal>
    </div>
  )
}
