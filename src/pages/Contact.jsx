import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { CONTACT } from '../data/site'

const initialForm = { name: '', email: '', service: 'Website Development', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initialForm)
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
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FiCheckCircle className="h-12 w-12 text-gold-500" />
                  <h3 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-white">
                    Thank you — message received!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-300">
                    We'll be in touch at {form.email || 'your email'} within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setForm(initialForm); setSubmitted(false) }}
                    className="mt-6 text-sm font-semibold text-gold-500 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
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
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@company.com"
                        className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                      Service Needed
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    >
                      <option>Website Development</option>
                      <option>AI Implementation</option>
                      <option>Full-Stack Engineering</option>
                      <option>Database Solutions</option>
                      <option>API & Integration</option>
                      <option>WebLogic / Enterprise Deployment</option>
                      <option>Something Else</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium text-ink-700 dark:text-ink-200">
                      Project Details
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, goals, and timeline..."
                      className="mt-2 w-full resize-none rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] sm:w-auto"
                  >
                    Send Message
                    <FiSend className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
