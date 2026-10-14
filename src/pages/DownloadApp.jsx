import { FiSmartphone, FiShield, FiBell, FiCamera, FiLock, FiWifi, FiRefreshCw } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import BackButton from '../components/coding/BackButton'
import AndroidDownloadButton from '../components/AndroidDownloadButton'
import { ANDROID_APP } from '../data/androidApp'
import { CONTACT } from '../data/site'
import { useSeo } from '../hooks/useSeo'

const INSTALL_STEPS = [
  {
    title: 'Download the APK',
    text: `Tap "Download APK" on your Android phone. The ${ANDROID_APP.size} file saves to your Downloads folder.`,
  },
  {
    title: 'Open the file',
    text: 'Tap the finished download in your notification bar, or open it from the Files / Downloads app.',
  },
  {
    title: 'Allow the install',
    text: 'If Android says installing unknown apps is blocked, tap Settings, turn on "Allow from this source" for your browser, then go back.',
  },
  {
    title: 'Install and open',
    text: 'Tap Install. When it finishes, open WebNest Studio from your app drawer.',
  },
]

const PERMISSIONS = [
  { icon: FiWifi, title: 'Internet and network state', text: 'To load your content and tell you when you are offline.' },
  { icon: FiBell, title: 'Notifications', text: 'To send you updates. Android 13 and later asks before allowing them.' },
  { icon: FiLock, title: 'Fingerprint / biometrics', text: 'To let you unlock the app with your fingerprint or face.' },
  { icon: FiCamera, title: 'Camera', text: 'Only used when you open a feature that needs it, and Android asks you first.' },
]

const FAQS = [
  {
    q: 'Android says "App not installed". What do I do?',
    a: 'Check that you have at least 150 MB of free space and that your phone runs Android 7.0 or later. If an older copy of the app came from somewhere other than this page, uninstall it first and try again.',
  },
  {
    q: 'Google Play Protect showed a warning.',
    a: 'Play Protect shows a notice for apps installed from outside the Play Store. This APK is signed by WebNest Studio; you can confirm the file is ours by checking its SHA-256 fingerprint above before installing.',
  },
  {
    q: 'How do I update the app?',
    a: 'Download the newest APK from this page and install it over the old one. Your data stays, because every release is signed with the same key.',
  },
  {
    q: 'Is there an iPhone version?',
    a: 'Not yet. On an iPhone or a computer you can use everything in your browser at webneststudio.co.in.',
  },
]

export default function DownloadApp() {
  useSeo({
    title: 'Download the WebNest Studio Android App',
    description: `Download the WebNest Studio app for Android (version ${ANDROID_APP.version}, ${ANDROID_APP.size}). Works on ${ANDROID_APP.minAndroid} and later, with step-by-step install instructions.`,
    path: '/download-app',
  })

  return (
    <div>
      <div className="px-6 pt-2 lg:px-8">
        <BackButton fallback="/" />
      </div>

      <section className="bg-grid px-6 pb-12 pt-4 lg:px-8 lg:pt-6">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
              <FiSmartphone className="h-3.5 w-3.5" /> Android App
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-4xl lg:text-[2.75rem]">
              WebNest Studio <span className="text-gradient-gold">on your phone</span>
            </h1>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-500 dark:text-ink-300 sm:text-lg">
              Install the official WebNest Studio app on any Android phone. Download the APK below and
              follow the four steps — it takes about a minute.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <AndroidDownloadButton />
              <a href="#install" className="text-sm font-semibold text-ink-600 hover:text-gold-500 dark:text-ink-200 dark:hover:text-gold-400">
                How to install
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
              On a computer? Open <span className="font-semibold text-ink-700 dark:text-ink-200">webneststudio.co.in/download-app</span> on
              your Android phone to download it there.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900/40">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-500">
                  <FiSmartphone className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">{ANDROID_APP.name}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-300">Official Android app</p>
                </div>
              </div>
              <dl className="mt-1">
                {[
                  ['Version', ANDROID_APP.version],
                  ['File size', ANDROID_APP.size],
                  ['Requires', `${ANDROID_APP.minAndroid} or later`],
                  ['Price', 'Free'],
                ].map(([label, value]) => (
                  <div key={label} className="mt-3 flex justify-between border-t border-ink-100 pt-3 text-sm dark:border-ink-800">
                    <dt className="text-ink-500 dark:text-ink-400">{label}</dt>
                    <dd className="font-semibold text-ink-900 dark:text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="install" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-16 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">How to install</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          The app is installed straight from our website rather than the Play Store, so Android asks you to
          allow the install once.
        </p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INSTALL_STEPS.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
                  <span className="font-display text-4xl font-extrabold text-ink-100 dark:text-ink-800">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <AndroidDownloadButton />
        </div>
      </section>

      <section className="bg-ink-50 py-16 dark:bg-ink-900/40">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">What the app asks for</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            These are the permissions declared in version {ANDROID_APP.version}. You can change any of them later in
            Settings → Apps → WebNest Studio → Permissions.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PERMISSIONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-gold-400/30 bg-gold-400/5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <FiShield className="h-5 w-5 text-gold-500" />
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Check the file is genuine</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Only install the app from this page. To be sure the download wasn&rsquo;t changed on the way, compare its
            SHA-256 fingerprint with this one:
          </p>
          <code className="mt-4 block break-all rounded-xl bg-ink-900 px-4 py-3 font-mono text-xs text-gold-300">
            {ANDROID_APP.sha256}
          </code>
          <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">
            File: {ANDROID_APP.fileName} · Package: {ANDROID_APP.packageName}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">Common questions</h2>
        <div className="mt-8 divide-y divide-ink-200 dark:divide-ink-800">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <h3 className="font-semibold text-ink-900 dark:text-white">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500 dark:text-ink-300">
          <FiRefreshCw className="h-4 w-4 text-gold-500" />
          Still stuck? Email{' '}
          <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">{CONTACT.email}</a>
        </p>
      </section>
    </div>
  )
}
