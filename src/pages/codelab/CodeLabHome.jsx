import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiCode, FiGrid, FiPlay } from 'react-icons/fi'
import BackButton from '../../components/coding/BackButton'
import Reveal from '../../components/Reveal'
import HeroVideo, { HERO_BACK_CLASS } from '../../components/HeroVideo'
import NeuralBackdrop from '../../components/NeuralBackdrop'
import CodeWindow from '../../components/CodeWindow'
import { useSeo } from '../../hooks/useSeo'

const links = [
  { to: '/codelab/playground', icon: FiPlay, title: 'Browser coding playground', text: 'Write and run Java 17, Python, and web code in a focused workspace.' },
  { to: '/codelab/problems', icon: FiCode, title: 'Guided coding problems', text: 'Work through practice tasks with requirements, examples, and difficulty levels.' },
  { to: '/learn', icon: FiBookOpen, title: 'Programming lessons', text: 'Follow structured courses, review concepts, and continue into hands-on practice.' },
  { to: '/codelab/dashboard', icon: FiGrid, title: 'Your learning dashboard', text: 'Sign in to review solved problems, XP, streaks, and recent activity.' },
]

const steps = [
  { title: 'Choose a language or topic', text: 'Start in the playground for a quick experiment, open a guided problem, or pick a course lesson to learn a concept step by step.' },
  { title: 'Read the task and plan a small change', text: 'Check the requirements and examples, then write a first version. For web work, edit the page and styles together; for Python and Java, focus on the program’s input and output.' },
  { title: 'Run, inspect, and improve', text: 'Use the result to find mistakes and try another case. Sign in when you want to submit a solution and keep track of your progress.' },
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
  useSeo({
    title: 'Webnest CodeLab: Browser Coding Playground and Practice',
    description: 'Practice Java, Python, and web development in Webnest CodeLab. Run code in the browser, solve guided problems, and follow programming lessons.',
    path: '/codelab',
  })

  return (
    <main>
      {/* -mt-22 pulls the hero up under the floating navbar (see Navbar). */}
      <section className="relative -mt-22 flex min-h-[80vh] items-center overflow-hidden bg-night px-6 pb-20 pt-44 lg:px-8">
        <HeroVideo base={HERO_VIDEO} dim={Boolean(HERO_VIDEO)}>{!HERO_VIDEO && <NeuralBackdrop fade="left" />}</HeroVideo>
        {!HERO_VIDEO && <div className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-gold-400/20 blur-[120px]" />}
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
                Learn programming by writing code, running examples, and working through practical exercises. Use one workspace for Java, Python, and web development.
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
        <section className="mb-14 max-w-3xl" aria-labelledby="codelab-intro">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400">Learn by doing</p>
          <h2 id="codelab-intro" className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white">A practical workspace for programming practice</h2>
          <p className="mt-4 leading-relaxed text-ink-600 dark:text-ink-200">
            Webnest CodeLab brings a browser coding playground together with guided problems and programming lessons. You can test a small idea, study a concept, then apply it in an exercise. The goal is to make practice easier to start and easier to repeat as you build confidence with code.
          </p>
        </section>

        <section aria-labelledby="codelab-tools">
          <div className="mb-5 max-w-2xl">
            <h2 id="codelab-tools" className="font-display text-2xl font-bold text-ink-900 dark:text-white">Choose how you want to practice</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">Move between a coding environment, a focused exercise, and a lesson whenever you need a different kind of practice.</p>
          </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-ink-800 dark:bg-ink-900/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{text}</p>
            </Link>
          ))}
        </div>
        </section>

        <section className="mt-16" aria-labelledby="codelab-workflow">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400">A simple workflow</p>
            <h2 id="codelab-workflow" className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">From first attempt to working solution</h2>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">Step {index + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="codelab-access">
          <h2 id="codelab-access" className="font-display text-2xl font-bold text-ink-900 dark:text-white">Practice first; sign in to save progress</h2>
          <p className="mt-4 leading-relaxed text-ink-600 dark:text-ink-200">
            You can open the playground and run code locally without signing in. Submitting a problem solution and viewing your personal progress use your Webnest account. If you are learning a new topic, start with a lesson; if you already know what you want to build, open the playground and experiment.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            CodeLab currently focuses on Java 17, Python, and browser-based web development. The linked lessons provide additional topics and explanations, while the practice area gives you a place to apply what you learn.
          </p>
        </section>
      </div>
    </main>
  )
}
