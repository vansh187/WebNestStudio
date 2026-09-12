import { CONTACT } from '../data/site'
import { useSeo } from '../hooks/useSeo'

function Step({ number, title, body }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40">
      <span className="font-display text-3xl font-extrabold text-gradient-gold">{number}</span>
      <h2 className="mt-3 font-display text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-ink-300">{body}</p>
    </div>
  )
}

export default function AccountDeletion() {
  useSeo({
    title: 'Account Deletion',
    description: 'Request deletion of your WebNest Studio app account and associated data.',
    path: '/account-deletion',
  })

  const deletionEmail =
    'mailto:vansh.duggal@webneststudio.co.in?subject=WebNest%20Studio%20account%20deletion%20request'

  return (
    <div className="bg-grid">
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <span className="inline-flex rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
          Account Deletion
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
          Delete your WebNest Studio account
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-ink-600 dark:text-ink-300">
          You can delete your WebNest Studio app account from inside the Android app or request deletion from this page.
          This page is provided for users who no longer have access to the app.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl gap-5 px-6 pb-10 lg:px-8">
        <Step
          number="01"
          title="Delete from the Android app"
          body="Open the WebNest Studio app, go to Profile, scroll below Log out, choose Delete account, and confirm. The app will request deletion, revoke your session, and sign you out."
        />
        <Step
          number="02"
          title="Request deletion by email"
          body="If you cannot access the app, email us from the address linked to your account and include your full name and registered email address."
        />
        <Step
          number="03"
          title="What happens next"
          body="We deactivate your account, revoke active sessions, and delete or anonymize associated personal data where possible. Some project, transaction, security, or legal records may be retained where required."
        />
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-ink-900 px-6 py-10 text-center dark:bg-gold-400 sm:px-10">
          <h2 className="font-display text-2xl font-bold text-white dark:text-ink-950">
            Request account deletion
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-300 dark:text-ink-800">
            Email us from your registered account email. We aim to respond within a reasonable time and will explain if
            any data must be retained for legal, security, or service reasons.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={deletionEmail}
              className="inline-flex rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105 dark:bg-ink-950 dark:text-white"
            >
              Email deletion request
            </a>
            <a
              href={CONTACT.emailHref}
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-300 hover:text-gold-300 dark:border-ink-800 dark:text-ink-950"
            >
              {CONTACT.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
