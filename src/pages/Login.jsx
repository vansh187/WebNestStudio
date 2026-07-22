import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertTriangle, FiLoader } from 'react-icons/fi'
import Logo from '../components/Logo'
import Reveal from '../components/Reveal'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { signup as signupApi } from '../api/auth'
import { getErrorDetail, applyFieldErrors } from '../lib/apiClient'
import { signupSchema, loginSchema, otpSchema } from '../schemas/leadSchemas'

function roleHome(role) {
  if (role === 'admin') return '/admin'
  return '/'
}

function Banner({ message, tone = 'error', action }) {
  if (!message) return null
  const toneClass = tone === 'error'
    ? 'border-red-400/40 bg-red-400/10 text-red-500'
    : 'border-gold-400/40 bg-gold-400/10 text-gold-600 dark:text-gold-400'
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p>{message}</p>
        {action}
      </div>
    </div>
  )
}

function LoginForm({ onSwitchToSignup, onNeedsVerification }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, getValues,
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    setBanner(null)
    const result = await login(values)
    if (result.ok) {
      const from = location.state?.from?.pathname
      navigate(from || roleHome(result.user.role), { replace: true })
      return
    }
    if (result.message?.toLowerCase().includes('verify')) {
      onNeedsVerification(getValues('email'))
      return
    }
    setBanner('Invalid email or password.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <Banner message={banner} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Email Address
        </label>
        <div className="relative mt-2">
          <FiMail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="jane@company.com"
            className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent py-3 pl-11 pr-4 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
      </div>

      <PasswordField register={register} error={errors.password} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : (
          <>
            Sign In
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-ink-500 dark:text-ink-300">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignup} className="font-semibold text-gold-500 hover:underline">
          Sign up
        </button>
      </p>
    </form>
  )
}

function PasswordField({ register, error }) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div>
      <label htmlFor="password" className="text-sm font-medium text-ink-700 dark:text-ink-200">
        Password
      </label>
      <div className="relative mt-2">
        <FiLock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
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
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error.message}</p>}
    </div>
  )
}

function SignupForm({ onSwitchToLogin, onSignedUp }) {
  const [banner, setBanner] = useState(null)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError,
  } = useForm({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (values) => {
    setBanner(null)
    setDuplicateEmail(false)
    try {
      const payload = { ...values, phone_number: values.phone_number || undefined }
      await signupApi(payload)
      onSignedUp(values.email)
    } catch (error) {
      if (error.response?.status === 409) {
        setDuplicateEmail(true)
        setError('email', { type: 'server', message: 'An account with this email already exists' })
        return
      }
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not create your account. Please try again.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <Banner message={banner} />
      <div>
        <label htmlFor="full_name" className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          {...register('full_name')}
          placeholder="Jane Doe"
          className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
        {errors.full_name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.full_name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Email Address
        </label>
        <div className="relative mt-2">
          <FiMail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="jane@company.com"
            className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent py-3 pl-11 pr-4 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            {errors.email.message}
            {duplicateEmail && (
              <>
                {' '}
                <button type="button" onClick={onSwitchToLogin} className="underline">
                  Log in instead?
                </button>
              </>
            )}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone_number" className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Phone Number <span className="text-ink-400">(optional)</span>
        </label>
        <input
          id="phone_number"
          type="tel"
          {...register('phone_number')}
          placeholder="9876543210"
          className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
      </div>

      <PasswordField register={register} error={errors.password} />
      <p className="-mt-3 text-xs text-ink-400">Must be 8–72 characters.</p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : (
          <>
            Create Account
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-ink-500 dark:text-ink-300">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-gold-500 hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}

function OtpForm({ email, purpose, onVerified, onSwitchToLogin }) {
  const { verifyOtp } = useAuth()
  const toast = useToast()
  const [banner, setBanner] = useState(null)
  const [resending, setResending] = useState(false)
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema) })

  const onSubmit = async ({ otp_code }) => {
    setBanner(null)
    const result = await verifyOtp({ email, otp_code, purpose })
    if (result.ok) {
      onVerified()
      return
    }
    setBanner(result.message)
  }

  const handleResend = async () => {
    setResending(true)
    setBanner(null)
    try {
      // No dedicated resend-OTP endpoint exists yet — best-effort re-trigger via signup.
      await signupApi({ full_name: 'Resend', email, password: 'Placeholder123' })
      toast.info('If this account needs a new code, it has been sent.')
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('A code was already sent to this email — check your inbox.')
      } else {
        toast.error(getErrorDetail(error, 'Could not resend the code.'))
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <Banner message={banner} />
      <p className="text-sm text-ink-500 dark:text-ink-300">
        We sent a 6-digit code to <span className="font-semibold text-ink-900 dark:text-white">{email}</span>.
      </p>
      <div>
        <label htmlFor="otp_code" className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Verification Code
        </label>
        <input
          id="otp_code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          {...register('otp_code')}
          placeholder="123456"
          className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-center text-lg tracking-[0.5em] text-ink-900 dark:text-white placeholder:tracking-normal placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
        {errors.otp_code && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.otp_code.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : 'Verify & Continue'}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-gold-500 hover:underline disabled:opacity-60"
        >
          {resending ? 'Resending…' : 'Resend code'}
        </button>
        <button type="button" onClick={onSwitchToLogin} className="text-ink-500 hover:underline dark:text-ink-300">
          Back to sign in
        </button>
      </div>
    </form>
  )
}

export default function Login() {
  const [view, setView] = useState('login')
  const [pendingEmail, setPendingEmail] = useState('')
  const [purpose, setPurpose] = useState('signup')

  const titles = {
    login: { title: 'Welcome back', subtitle: 'Sign in to track your project and collaborate with our team.' },
    signup: { title: 'Create your account', subtitle: 'Join WebNest Studio to start and follow your project.' },
    otp: { title: 'Verify your email', subtitle: 'One quick step before you can sign in.' },
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
              {titles[view].title}
            </h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{titles[view].subtitle}</p>
          </div>

          {view === 'login' && (
            <LoginForm
              onSwitchToSignup={() => setView('signup')}
              onNeedsVerification={(email) => { setPendingEmail(email); setPurpose('login'); setView('otp') }}
            />
          )}

          {view === 'signup' && (
            <SignupForm
              onSwitchToLogin={() => setView('login')}
              onSignedUp={(email) => { setPendingEmail(email); setPurpose('signup'); setView('otp') }}
            />
          )}

          {view === 'otp' && (
            <OtpForm
              email={pendingEmail}
              purpose={purpose}
              onVerified={() => setView('login')}
              onSwitchToLogin={() => setView('login')}
            />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-400 dark:text-ink-500">
          <Link to="/" className="hover:text-gold-500">← Back to homepage</Link>
        </p>
      </Reveal>
    </div>
  )
}
