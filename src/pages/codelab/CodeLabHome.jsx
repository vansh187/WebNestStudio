import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiCode, FiGrid, FiPlay } from 'react-icons/fi'
import BackButton from '../../components/coding/BackButton'
import Reveal from '../../components/Reveal'
import HeroVideo, { HERO_BACK_CLASS } from '../../components/HeroVideo'
import NeuralBackdrop from '../../components/NeuralBackdrop'
import CodeWindow from '../../components/CodeWindow'
import { useSeo } from '../../hooks/useSeo'

const links = [
  { to: '/codelab/playground', icon: FiPlay, title: 'Playground', text: 'Practice Java 17, Python, and web development.' },
  { to: '/codelab/problems', icon: FiCode, title: 'Problems', text: 'Practice with auth-aware progress and submissions.' },
  { to: '/learn', icon: FiBookOpen, title: 'Learn', text: 'Read lessons, save notes, and open practice work.' },
  { to: '/codelab/dashboard', icon: FiGrid, title: 'Dashboard', text: 'Track solved problems, XP, streaks, and activity.' },
]

// Set to '/media/codelab-hero' once the video files are in public/media (see HeroVideo).
const HERO_VIDEO = null

// Typed in the hero's editor window: a small model being trained (see CodeWindow).
const MODEL_CODE = [
  [['c', '# train a model, right in your browser']],
  [['k', 'from '], ['p', 'sklearn.linear_model '], ['k', 'import '], ['p', 'LogisticRegression']],
  [],
  [['p', 'model = '], ['f', 'LogisticRegression'], ['p', '()']],
  [['p', 'model.'], ['f', 'fit'], ['p', '(X_train, y_train)']],
  [],
  [['p', 'score = model.'], ['f', 'score'], ['p', '(X_test, y_test)']],
  [['f', 'print'], ['p', '('], ['s', "f'accuracy: {score:.2f}'"], ['p', ')']],
]
const MODEL_OUTPUT = ['loading data ...', 'training model ...', 'accuracy: 0.94']

export default function CodeLabHome() {
  useSeo({ title: 'Webnest CodeLab', description: 'Code, practice, and learn in Webnest CodeLab.', path: '/codelab' })

  return (
    <main>
      {/* -mt-22 pulls the hero up under the floating navbar (see Navbar). */}
      <section className="relative -mt-22 flex min-h-[80vh] items-center overflow-hidden bg-ink-950 px-6 pb-20 pt-44 lg:px-8">
        <HeroVideo base={HERO_VIDEO}>{!HERO_VIDEO && <NeuralBackdrop />}</HeroVideo>
        <BackButton fallback="/" className={HERO_BACK_CLASS} />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
                Webnest CodeLab
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-5xl">
                Browser-first coding and <span className="text-gradient-gold">learning workspace</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-200 lg:mx-0">
                Build web snippets, run Python in your browser, and practice Java with the Webnest playground.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link to="/codelab/playground" className="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105">
                  <FiPlay className="h-4 w-4" /> Open the playground
                </Link>
                <Link to="/codelab/problems" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:border-gold-400 hover:text-gold-400">
                  Solve problems <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <CodeWindow className="mx-auto w-full max-w-xl" file="train_model.py" command="python train_model.py" code={MODEL_CODE} output={MODEL_OUTPUT} />
          </Reveal>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-ink-800 dark:bg-ink-900/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{text}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
