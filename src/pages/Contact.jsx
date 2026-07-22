import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { FormField, ConsentCheckbox } from '../components/forms/FormField'
import { CONTACT } from '../data/site'
import { submitLead } from '../api/leads'
import { getErrorDetail, applyFieldErrors } from '../lib/apiClient'
import { getUtmParams } from '../lib/utm'
import { contactSchema, startProjectSchema, consultationSchema } from '../schemas/leadSchemas'
import { useToast } from '../context/ToastContext'

const TABS = [
  { key: 'contact_form', label: 'Send a Message' },
  { key: 'start_project', label: 'Start a Project' },
  { key: 'consultation_booking', label: 'Book a Free Consultation' },
]

function SuccessPanel({ email, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FiCheckCircle className="h-12 w-12 text-gold-500" />
      <h3 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-white">
        Thank you — we've got it!
      </h3>
      <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-300">
        We'll be in touch at {email} within one business day.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm font-semibold text-gold-500 hover:underline"
      >
        Send another message
      </button>
    </div>
  )
}

function SubmitButton({ submitting, label = 'Send Message' }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {submitting ? 'Sending…' : label}
      <FiSend className="h-4 w-4" />
    </button>
  )
}

function FormBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-500">
      <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function ContactForm() {
  const toast = useToast()
  const [success, setSuccess] = useState(null)
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError, reset,
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { consent_given: false } })

  const onSubmit = async (values) => {
    setBanner(null)
    try {
      await submitLead({ source: 'contact_form', ...values })
      toast.success('Message sent — we\'ll reply within one business day.')
      setSuccess(values.email)
    } catch (error) {
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not send your message. Please try again.'))
    }
  }

  if (success) return <SuccessPanel email={success} onReset={() => { setSuccess(null); reset() }} />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormBanner message={banner} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full Name" name="full_name" register={register} error={errors.full_name} placeholder="Jane Doe" />
        <FormField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="jane@company.com" />
      </div>
      <FormField label="Phone Number" name="phone_number" register={register} error={errors.phone_number} placeholder="9876543210" />
      <FormField label="Project Details" name="message" as="textarea" rows={5} register={register} error={errors.message} placeholder="Tell us about your project, goals, and timeline..." />
      <ConsentCheckbox register={register} error={errors.consent_given} />
      <SubmitButton submitting={isSubmitting} />
    </form>
  )
}

function StartProjectForm() {
  const toast = useToast()
  const [success, setSuccess] = useState(null)
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError, reset,
  } = useForm({ resolver: zodResolver(startProjectSchema), defaultValues: { consent_given: false } })

  const onSubmit = async (values) => {
    setBanner(null)
    try {
      await submitLead({ source: 'start_project', ...values, ...getUtmParams() })
      toast.success('Got it — we\'ll reach out within 1 business day with next steps.')
      setSuccess(values.email)
    } catch (error) {
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not submit your project brief. Please try again.'))
    }
  }

  if (success) return <SuccessPanel email={success} onReset={() => { setSuccess(null); reset() }} />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormBanner message={banner} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full Name" name="full_name" register={register} error={errors.full_name} placeholder="Jane Doe" />
        <FormField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="jane@company.com" />
      </div>
      <FormField label="Phone Number" name="phone_number" register={register} error={errors.phone_number} placeholder="9876543210" />
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Project Type" name="project_type" as="select" register={register} error={errors.project_type} defaultValue="">
          <option value="" disabled>Select…</option>
          <option>Website</option>
          <option>Web App</option>
          <option>AI Product</option>
          <option>Enterprise System</option>
          <option>Something Else</option>
        </FormField>
        <FormField label="Budget Range" name="budget_range" as="select" register={register} error={errors.budget_range} defaultValue="">
          <option value="" disabled>Select…</option>
          <option>Under $5k</option>
          <option>$5k-$10k</option>
          <option>$10k-$25k</option>
          <option>$25k+</option>
        </FormField>
        <FormField label="Timeline" name="timeline" as="select" register={register} error={errors.timeline} defaultValue="">
          <option value="" disabled>Select…</option>
          <option>ASAP</option>
          <option>1 month</option>
          <option>3 months</option>
          <option>Flexible</option>
        </FormField>
      </div>
      <FormField label="Project Details (optional)" name="message" as="textarea" rows={4} register={register} error={errors.message} placeholder="Anything else we should know?" />
      <ConsentCheckbox register={register} error={errors.consent_given} />
      <p className="text-xs text-ink-400">We'll reach out within 1 business day with a plan, a timeline, and a straight answer.</p>
      <SubmitButton submitting={isSubmitting} label="Start My Project" />
    </form>
  )
}

function ConsultationForm() {
  const toast = useToast()
  const [success, setSuccess] = useState(null)
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError, reset,
  } = useForm({ resolver: zodResolver(consultationSchema), defaultValues: { consent_given: false } })

  const onSubmit = async (values) => {
    setBanner(null)
    try {
      await submitLead({ source: 'consultation_booking', ...values })
      toast.success('Consultation requested — we\'ll confirm your slot by email.')
      setSuccess(values.email)
    } catch (error) {
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not book your consultation. Please try again.'))
    }
  }

  if (success) return <SuccessPanel email={success} onReset={() => { setSuccess(null); reset() }} />

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormBanner message={banner} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full Name" name="full_name" register={register} error={errors.full_name} placeholder="Jane Doe" />
        <FormField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="jane@company.com" />
      </div>
      <FormField label="Phone Number" name="phone_number" register={register} error={errors.phone_number} placeholder="9876543210" />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Preferred Date" name="preferred_date" type="date" min={today} register={register} error={errors.preferred_date} />
        <FormField label="Preferred Time Slot" name="preferred_time_slot" as="select" register={register} error={errors.preferred_time_slot} defaultValue="">
          <option value="" disabled>Select…</option>
          <option>10:00-10:30 IST</option>
          <option>12:00-12:30 IST</option>
          <option>15:00-15:30 IST</option>
          <option>18:00-18:30 IST</option>
        </FormField>
      </div>
      <ConsentCheckbox register={register} error={errors.consent_given} />
      <SubmitButton submitting={isSubmitting} label="Book My Consultation" />
    </form>
  )
}

const FORM_COMPONENTS = {
  contact_form: ContactForm,
  start_project: StartProjectForm,
  consultation_booking: ConsultationForm,
}

export default function Contact() {
  const [tab, setTab] = useState('contact_form')
  const ActiveForm = FORM_COMPONENTS[tab]

  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Contact Us
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Let's discuss your project.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            Reach out with your idea, timeline, or budget — a member of our team will get back
            to you within one business day.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="h-full space-y-6">
              <a
                href={CONTACT.phoneHref}
                className="flex items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 transition-colors hover:border-gold-400/60"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <FiPhone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
                    Call Us
                  </p>
                  <p className="mt-1 font-display font-semibold text-ink-900 dark:text-white">
                    {CONTACT.phone}
                  </p>
                </div>
              </a>

              <a
                href={CONTACT.emailHref}
                className="flex items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 transition-colors hover:border-gold-400/60"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <FiMail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
                    Email Us
                  </p>
                  <p className="mt-1 truncate font-display font-semibold text-ink-900 dark:text-white">
                    {CONTACT.email}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
                    Working Hours
                  </p>
                  <p className="mt-1 font-display font-semibold text-ink-900 dark:text-white">
                    Mon – Sat, 9:00 AM – 8:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-8">
              <div className="mb-8 flex flex-wrap gap-2 border-b border-ink-200 dark:border-ink-800 pb-4">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      tab === t.key
                        ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950'
                        : 'text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <ActiveForm key={tab} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
