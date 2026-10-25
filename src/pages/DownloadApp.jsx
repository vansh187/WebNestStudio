import {
  FiArrowLeft, FiArrowRight, FiBattery, FiBell, FiBookOpen, FiCamera, FiCheck, FiGrid, FiLock, FiMoreVertical,
  FiPlayCircle, FiRefreshCw, FiSearch, FiShield, FiSmartphone, FiUser, FiWifi,
} from 'react-icons/fi'
import { FaGooglePlay } from 'react-icons/fa'
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
    title: 'Open Google Play',
    text: 'Tap "Get it on Google Play". On your phone it opens the Play Store app straight on WebNest Studio.',
  },
  {
    title: 'Tap Install',
    text: 'Google Play downloads and installs the app for you. No settings to change and nothing to allow.',
  },
  {
    title: 'Open the app',
    text: 'Tap Open, or find WebNest Studio in your app drawer. Updates arrive automatically through Google Play.',
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
    q: "Google Play says the app isn't available for my device.",
    a: `The app needs ${ANDROID_APP.minAndroid} or later. Check Settings → About phone → Android version. On an older phone you can use everything in your browser at webneststudio.co.in.`,
  },
  {
    q: 'I installed an older copy from this website before. What now?',
    a: 'Install from Google Play to get automatic updates. If Google Play says it cannot install over the existing app, uninstall the old copy first, then install from Google Play.',
  },
  {
    q: 'How do I update the app?',
    a: 'Google Play updates it automatically. To update now, open WebNest Studio in the Play Store and tap Update.',
  },
  {
    q: 'Is there an iPhone version?',
    a: 'Not yet. On an iPhone or a computer you can use everything in your browser at webneststudio.co.in.',
  },
]

// HERO_BACK_CLASS's look without its absolute positioning.
const BACK_CLASS = 'rounded-full border border-gold-400/50 bg-ink-950/50 px-4 font-semibold text-gold-400! backdrop-blur hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950!'

const HERO_FACTS = ['Free', 'On Google Play', `${ANDROID_APP.minAndroid}+`, 'Automatic updates']

// A phone showing the app's Google Play listing, drawn to look like the real Play Store
// screen. Only facts that are true for the listing appear here; no ratings or download
// counts (those come from Google Play and change).
const PLAY_STATS = [
  ['Free', 'Price'],
  [`${ANDROID_APP.minAndroid.replace('Android ', '')}+`, 'Android'],
  ['Auto', 'Updates'],
]

const PLAY_NAV = [
  { icon: FiPlayCircle, label: 'Games' },
  { icon: FiGrid, label: 'Apps' },
  { icon: FiSearch, label: 'Search', active: true },
  { icon: FiBookOpen, label: 'Books' },
  { icon: FiUser, label: 'You' },
]

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64 sm:w-[17rem]">
      <div className="pointer-events-none absolute inset-x-4 bottom-0 top-12 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="relative rounded-[2.75rem] border border-white/15 bg-gradient-to-b from-[#2b2823] to-[#121110] p-2.5 shadow-2xl shadow-black/60">
        <div className="overflow-hidden rounded-[2.25rem] bg-white font-sans text-[#1f1f1f]" aria-hidden="true">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-[#1f1f1f]">
            <span>10:48</span>
            <span className="h-4 w-14 rounded-full bg-black" />
            <span className="flex items-center gap-1"><FiWifi className="h-3 w-3" /><FiBattery className="h-3 w-3" /></span>
          </div>
          {/* Play Store top bar */}
          <div className="mt-2 flex items-center justify-between px-4 text-[#444746]">
            <FiArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-4">
              <FiSearch className="h-4 w-4" />
              <FiMoreVertical className="h-4 w-4" />
            </div>
          </div>
          {/* App header */}
          <div className="mt-4 flex items-center gap-3 px-4">
            <img
              src={logoMark}
              alt=""
              width="64"
              height="64"
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md ring-1 ring-black/10"
            />
            <div className="min-w-0">
              <p className="truncate text-[17px] font-medium leading-tight">{ANDROID_APP.name}</p>
              <p className="mt-0.5 truncate text-[12px] font-medium text-[#0b57d0]">WebNest Studio</p>
              <p className="mt-0.5 text-[10px] text-[#444746]">Communication</p>
            </div>
          </div>
          {/* Stats row */}
          <dl className="mt-4 grid grid-cols-3 divide-x divide-[#e0e0e0] px-2 text-center">
            {PLAY_STATS.map(([value, label]) => (
              <div key={label} className="flex min-w-0 flex-col-reverse px-1">
                <dt className="mt-0.5 text-[9px] text-[#444746]">{label}</dt>
                <dd className="truncate text-[11px] font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {/* Install button */}
          <div className="mt-4 px-4">
            <div className="rounded-full bg-[#0b57d0] py-2 text-center text-[13px] font-medium text-white">Install</div>
          </div>
          {/* About this app */}
          <div className="mt-5 px-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium">About this app</p>
              <FiArrowRight className="h-3.5 w-3.5 text-[#444746]" />
            </div>
            <p className="mt-1.5 text-[10.5px] leading-snug text-[#444746]">
              The official WebNest Studio app: updates, notifications and fingerprint unlock on your Android phone.
            </p>
            <span className="mt-2 inline-block rounded-lg border border-[#c4c7c5] px-2 py-0.5 text-[9.5px] text-[#444746]">Communication</span>
          </div>
          {/* Bottom navigation */}
          <nav className="mt-5 grid grid-cols-5 border-t border-[#e0e0e0] bg-[#f8fafd] px-1 pb-2 pt-2">
            {PLAY_NAV.map(({ icon: Icon, label, active }) => (
              <span key={label} className={`flex flex-col items-center gap-0.5 text-[8.5px] ${active ? 'font-semibold text-[#0b57d0]' : 'text-[#444746]'}`}>
                <span className={`flex h-5 w-9 items-center justify-center rounded-full ${active ? 'bg-[#d3e3fd]' : ''}`}><Icon className="h-3.5 w-3.5" /></span>
                {label}
              </span>
            ))}
          </nav>
          <div className="flex justify-center bg-[#f8fafd] pb-2"><span className="h-1 w-20 rounded-full bg-[#1f1f1f]/40" /></div>
        </div>
      </div>
      {/* Below the phone, never on top of it, so no part of the screen is hidden. */}
      <div className="relative mt-5 flex flex-wrap justify-center gap-2">
        <span className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur">
          <FaGooglePlay className="h-4 w-4 text-gold-400" /> On Google Play
        </span>
        <span className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur">
          <FiLock className="h-4 w-4 text-gold-400" /> Fingerprint unlock
        </span>
      </div>
    </div>
  )
}

export default function DownloadApp() {
  useSeo({
    title: 'Download the WebNest Studio Android App',
    description: `Get the free WebNest Studio app for Android on Google Play. Works on ${ANDROID_APP.minAndroid} and later, installs in one tap and updates automatically.`,
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
                Install the official WebNest Studio app from Google Play in one tap: nothing to allow, and updates arrive automatically.
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
                On a computer? The Google Play page lets you install it on your Android phone when you&rsquo;re signed in
                with the same Google account.
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
          The app comes from Google Play, so there are no settings to change and no &ldquo;unknown apps&rdquo; to allow.
        </p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
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
            Google Play lists these under the app&rsquo;s &ldquo;About this app&rdquo; section too. You can change any of them later in
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
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Make sure it&rsquo;s the real app</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Only install WebNest Studio from Google Play, using the button on this page. Google Play checks the app
            before it reaches your phone. The official app&rsquo;s developer is WebNest Studio, and its Play Store ID is:
          </p>
          <code className="mt-4 block break-all rounded-xl bg-ink-900 px-4 py-3 font-mono text-xs text-gold-300">
            {ANDROID_APP.packageName}
          </code>
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
