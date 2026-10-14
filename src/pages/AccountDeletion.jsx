import Reveal from '../components/Reveal'
import BackButton from '../components/coding/BackButton'
import { CONTACT } from '../data/site'
import { useSeo } from '../hooks/useSeo'

const DATA_DELETED = [
  'Your account profile, including your name, email address, and phone number',
  'Saved coding projects, playground snippets, and submission history',
  'CodeLab progress, streaks, XP, bookmarks, and notes',
  'AI project-planning conversations and generated plans',
]

export default function AccountDeletion() {
  useSeo({
    title: 'Account and Data Deletion',
    description: 'How to request deletion of your WebNest Studio account and associated personal data.',
    path: '/account-deletion',
  })

  return (
    <div>
      <div className="px-6 pt-6 lg:px-8">
        <BackButton fallback="/" />
      </div>
      <section className="bg-grid px-6 py-16 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Account Help
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold text-ink-900 dark:text-white">
            Account and data deletion
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500 dark:text-ink-300">
            You can delete your WebNest Studio account in the app or request deletion by email. You do not need to sign in to submit an email request.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-6 py-12 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Delete from the app</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            In the Android app, open your Profile, scroll below Log out, choose Delete account, and confirm. The app submits the deletion request, revokes your session, and signs you out. You can also sign in on the website and use the <a href="/delete-account" className="font-semibold text-gold-500 hover:underline">Delete Account</a> page.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Request deletion by email</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Email <a href={`${CONTACT.emailHref}?subject=WebNest%20Studio%20account%20deletion%20request`} className="font-semibold text-gold-500 hover:underline">{CONTACT.email}</a> from the address associated with your account. Include “Account deletion request” in the subject. We may ask for information needed to verify the request, and we will process verified requests within 30 days.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Data that is deleted</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Account deletion removes your account profile and associated personal data, including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            {DATA_DELETED.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            We may retain limited records where required by law or for legitimate security and transaction recordkeeping. Any retained data is restricted to that purpose and kept only for the period required.
          </p>
        </Reveal>
      </section>
    </div>
  )
}
