import { FiSmartphone, FiShield, FiBell, FiCamera, FiLock, FiWifi, FiRefreshCw, FiCheck, FiDownload } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import BackButton from '../components/coding/BackButton'
import HeroVideo from '../components/HeroVideo'
import NeuralBackdrop from '../components/NeuralBackdrop'
import AndroidDownloadButton from '../components/AndroidDownloadButton'
import logoMark from '../assets/logo.png'
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

// HERO_BACK_CLASS's look without its absolute positioning.
const BACK_CLASS = 'rounded-full border border-gold-400/50 bg-ink-950/50 px-4 font-semibold text-gold-400! backdrop-blur hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950!'

const HERO_FACTS =['Free', ANDROID_APP.size, `${ANDROID_APP.minAndroid}+`, 'Signed by WebNest Studio']

// A drawn phone showing the app's details, in place of a screenshot.
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64 sm:w-[17rem]">
      <div className="pointer-events-none absolute inset-x-4 bottom-0 top-12 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="relative rounded-[2.75rem] border border-white/15 bg-gradient-to-b from-[#2b2823] to-[#121110] p-2.5 shadow-2xl shadow-black/60">
        <div className="overflow-hidden rounded-[2.25rem] bg-ink-950 px-5 pb-4 pt-4">
          <div className="flex items-center justify-between text-[10px] font-semibold text-ink-300">
            <span>9:41</span>
            <span className="h-4 w-16 rounded-full bg-black" />
            <span>5G</span>
          </div>
          <img
            src={logoMark}
            alt=""
            width="88"
            height="88"
            className="mx-auto mt-8 h-22 w-22 rounded-[1.5rem] object-cover shadow-lg shadow-gold-500/20 ring-1 ring-gold-400/40"
          />
          <p className="mt-5 text-center font-display text-lg font-semibold text-white">{ANDROID_APP.name}</p>
          <p className="text-center text-xs text-ink-400">Official Android app</p>
          <dl className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 text-center">
            {[
              ['Version', ANDROID_APP.version],
              ['Size', ANDROID_APP.size],
              ['Android', `${ANDROID_APP.minAndroid.replace('Android ', '')}+`],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-400">{label}</dt>
                <dd className="text-sm font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 space-y-3 text-xs text-ink-300">
            <li className="flex items-center gap-2"><FiShield className="h-3.5 w-3.5 text-gold-400" /> Signed by WebNest Studio</li>
            <li className="flex items-center gap-2"><FiCheck className="h-3.5 w-3.5 text-gold-400" /> Installs straight from our site</li>
            <li className="flex items-center gap-2"><FiCheck className="h-3.5 w-3.5 text-gold-400" /> Free updates from this page</li>
          </ul>
          <div className="mx-auto mt-7 h-1 w-24 rounded-full bg-white/30" />
        </div>
      </div>
      <div className="absolute -left-12 top-28 hidden items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur sm:flex">
        <FiDownload className="h-4 w-4 text-gold-400" /> Free download
      </div>
      <div className="absolute -right-14 bottom-5 hidden items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur sm:flex">
        <FiLock className="h-4 w-4 text-gold-400" /> Fingerprint unlock
      </div>
    </div>
  )
}

export default function DownloadApp() {
  useSeo({
    title: 'Download the WebNest Studio Android App',
    description: `Download the WebNest Studio app for Android (version ${ANDROID_APP.version}, ${ANDROID_APP.size}). Works on ${ANDROID_APP.minAndroid} and later, with step-by-step install instructions.`,
    path: '/download-app',
  })

  return (
    <div>
      {/* -mt-22 pulls the hero up under the floating navbar (see Navbar). "dark" switches
          the download button inside to its gold variant. */}
      <section className="dark relative -mt-22 overflow-hidden bg-night px-6 pb-10 pt-24 lg:px-8 lg:pb-12">
        <HeroVideo dim={false}><NeuralBackdrop fade="left" /></HeroVideo>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-gold-400/20 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <Reveal>
              {/* In the flow rather than absolutely placed, so hero content can never sit under
                  it; inside this column so the phone beside it can use the full height. */}
              <BackButton fallback="/" className={BACK_CLASS} />
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
                  <FiSmartphone className="h-3.5 w-3.5" /> Android App
                </span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[2.75rem]">
                WebNest Studio <span className="text-gradient-gold">on your phone</span>
              </h1>
              <p className="mt-3 max-w-xl leading-relaxed text-ink-200 lg:text-lg">
                Install the official WebNest Studio app on any Android phone — it takes about a minute.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <AndroidDownloadButton />
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-400"
                >
                  How to install
                </a>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {HERO_FACTS.map((fact) => (
                  <li key={fact} className="flex items-center gap-2 text-sm text-ink-300">
                    <FiCheck className="h-4 w-4 text-gold-400" /> {fact}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink-400">
                On a computer? Open <span className="font-semibold text-ink-200">webneststudio.co.in/download-app</span> on
                your Android phone to download it there.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <PhoneMockup />
            </Reveal>
          </div>
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
