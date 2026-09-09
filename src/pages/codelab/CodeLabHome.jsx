import { Link } from 'react-router-dom'
import { FiBookOpen, FiCode, FiGrid, FiPlay } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo'

const links = [
  { to: '/codelab/playground', icon: FiPlay, title: 'Playground', text: 'Run web files and Python locally in the browser.' },
  { to: '/codelab/problems', icon: FiCode, title: 'Problems', text: 'Practice with auth-aware progress and submissions.' },
  { to: '/learn', icon: FiBookOpen, title: 'Learn', text: 'Read lessons, save notes, and open practice work.' },
  { to: '/codelab/dashboard', icon: FiGrid, title: 'Dashboard', text: 'Track solved problems, XP, streaks, and activity.' },
]

export default function CodeLabHome() {
  useSeo({ title: 'Webnest CodeLab', description: 'Code, practice, and learn in Webnest CodeLab.', path: '/codelab' })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Webnest CodeLab</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink-900 dark:text-white">Browser-first coding and learning workspace</h1>
        <p className="mt-3 text-ink-500 dark:text-ink-300">Build web snippets in a sandboxed iframe, run Python through Pyodide, and move from lessons into practice without a server-side compiler.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="rounded-lg border border-ink-200 bg-white p-5 transition-colors hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
            <Icon className="h-6 w-6 text-gold-500" />
            <h2 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{text}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
