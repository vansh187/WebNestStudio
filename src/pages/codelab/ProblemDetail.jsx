import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiCheckCircle, FiSend } from 'react-icons/fi'
import { getProblem, submitProblem } from '../../api/codelab'
import { SAMPLE_PROBLEMS, WEB_FILES, PYTHON_FILES, cloneFiles } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSeo } from '../../hooks/useSeo'
import { useCodeRunner } from '../../hooks/useCodeRunner'
import CodingWorkspace from '../../components/coding/CodingWorkspace'
import ErrorBoundary from '../../components/ErrorBoundary'
import { ErrorState, NotFoundState } from '../../components/states/StateViews'

function normalizeProblem(data, slug) {
  const sample = SAMPLE_PROBLEMS.find((item) => item.slug === slug)
  const source = data?.id || data?.slug ? { ...sample, ...data } : sample
  if (!source) return null
  return {
    id: source.id || source.slug,
    slug: source.slug || slug,
    title: source.title || 'Untitled problem',
    description: source.description || '',
    statement: source.statement || sample?.statement || '',
    input_format: source.input_format || '',
    output_format: source.output_format || '',
    constraints: Array.isArray(source.constraints) && source.constraints.length ? source.constraints : sample?.constraints || [],
    learning_objectives: Array.isArray(source.learning_objectives) && source.learning_objectives.length ? source.learning_objectives : sample?.learning_objectives || [],
    acceptance_criteria: Array.isArray(source.acceptance_criteria) && source.acceptance_criteria.length ? source.acceptance_criteria : sample?.acceptance_criteria || [],
    hints: Array.isArray(source.hints) && source.hints.length ? source.hints : sample?.hints || [],
    topics: Array.isArray(source.topics) ? source.topics : [],
    language: source.language || source.track || 'python',
    difficulty: source.difficulty || 'easy',
    points: Number(source.points || 0),
    examples: Array.isArray(source.examples) && source.examples.length ? source.examples : sample?.examples || [],
    public_tests: Array.isArray(source.public_tests) ? source.public_tests : [],
    starter_files: cloneFiles(source.starter_files, (source.language || source.track) === 'web' ? WEB_FILES : PYTHON_FILES),
    user_progress: source.user_progress || {},
  }
}

export default function ProblemDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const runner = useCodeRunner()
  const [problem, setProblem] = useState(null)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [stdin, setStdin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // The slug whose request has finished; until it matches, the problem is still loading.
  const [loadedSlug, setLoadedSlug] = useState(null)

  useSeo({ title: problem?.title ? `${problem.title} | CodeLab` : 'CodeLab Problem', description: problem?.description || problem?.statement || 'Solve a Webnest CodeLab problem.', noindex: true, path: `/codelab/problems/${slug || ''}` })

  useEffect(() => {
    let alive = true
    async function load() {
      setError('')
      try {
        const data = await getProblem(slug)
        const next = normalizeProblem(data, slug)
        if (alive) {
          setProblem(next)
          setFiles(next?.starter_files || [])
          setSelectedFile(next?.starter_files?.[0]?.name || '')
          setStdin(next?.examples?.[0]?.input || '')
        }
      } catch (err) {
        const next = normalizeProblem(null, slug)
        if (alive) {
          setProblem(next)
          setFiles(next?.starter_files || [])
          setSelectedFile(next?.starter_files?.[0]?.name || '')
          setStdin(next?.examples?.[0]?.input || '')
          setError(next ? '' : getErrorDetail(err, 'Could not load this problem.'))
        }
      } finally {
        if (alive) setLoadedSlug(slug)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [slug])

  const handleFileChange = useCallback((fileName, value) => {
    setFiles((items) => items.map((file) => (file.name === fileName ? { ...file, content: value } : file)))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info('Log in to submit your solution.')
      navigate('/login', { state: { from: location } })
      return
    }
    setSubmitting(true)
    try {
      const result = runner.result || { status: 'failed', stdout: '', stderr: '', runtime_ms: 0 }
      const passed = result.status === 'success'
      const response = await submitProblem({
        problem_id: problem.id,
        language: problem.language,
        files,
        result: {
          status: passed ? 'passed' : result.status,
          score: passed ? 100 : 0,
          passed_tests: passed ? (problem.public_tests.length || 1) : 0,
          total_tests: problem.public_tests.length || 1,
          stdout: result.stdout || '',
          stderr: result.stderr || result.error || '',
          runtime_ms: result.runtime_ms || 0,
        },
      })
      toast.success(`Submitted. Best score: ${response?.best_score ?? (passed ? 100 : 0)}.`)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not submit your solution.'))
    } finally {
      setSubmitting(false)
    }
  }, [isAuthenticated, toast, navigate, location, runner.result, problem, files])

  if (loadedSlug !== slug) {
    return (
      <div className="mx-auto mt-6 max-w-6xl px-4 pb-8 sm:px-6 lg:px-8" role="status" aria-live="polite">
        <span className="sr-only">Loading problem…</span>
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-lg bg-ink-100 dark:bg-ink-900" />
          <div className="h-8 w-1/3 rounded bg-ink-100 dark:bg-ink-900" />
          <div className="h-96 rounded-lg bg-ink-100 dark:bg-ink-900" />
        </div>
      </div>
    )
  }

  if (!problem) return <NotFoundState title="Problem not found" backTo="/codelab/problems" backLabel="Back to problems" />

  const statement = (
    <ErrorBoundary>
      <aside className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
          <span>{problem.difficulty}</span>
          <span>{problem.points} XP</span>
        </div>
        {problem.description && <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-300">{problem.description}</p>}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink-700 dark:text-ink-100">{problem.statement}</p>
        {!!problem.topics.length && <p className="mt-3 text-xs text-ink-400">Topics: {problem.topics.join(', ')}</p>}
        {(problem.input_format || problem.output_format) && (
          <section className="mt-5 grid gap-3 border-t border-ink-200 pt-4 text-sm dark:border-ink-800 sm:grid-cols-2" aria-label="Input and output format">
            {problem.input_format && <div><h2 className="font-semibold text-ink-900 dark:text-white">Input</h2><p className="mt-1 leading-relaxed text-ink-500 dark:text-ink-300">{problem.input_format}</p></div>}
            {problem.output_format && <div><h2 className="font-semibold text-ink-900 dark:text-white">Output</h2><p className="mt-1 leading-relaxed text-ink-500 dark:text-ink-300">{problem.output_format}</p></div>}
          </section>
        )}
        {!!problem.constraints.length && (
          <section className="mt-4" aria-labelledby="problem-constraints">
            <h2 id="problem-constraints" className="text-sm font-semibold text-ink-900 dark:text-white">Requirements and constraints</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600 dark:text-ink-200">{problem.constraints.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}
        {problem.examples.map((example, index) => (
          <div key={`${example.input}-${index}`} className="mt-4 rounded-lg bg-ink-50 p-3 dark:bg-ink-950">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Example {index + 1}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div><p className="text-xs font-semibold text-ink-500 dark:text-ink-300">Input</p><pre className="mt-1 min-h-8 whitespace-pre-wrap rounded bg-white p-2 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-100">{example.input || '(empty line)'}</pre></div>
              <div><p className="text-xs font-semibold text-ink-500 dark:text-ink-300">Expected output</p><pre className="mt-1 min-h-8 whitespace-pre-wrap rounded bg-white p-2 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-100">{example.expected_output || '(none)'}</pre></div>
            </div>
            {example.explanation && <p className="mt-2 text-xs leading-relaxed text-ink-500 dark:text-ink-300">{example.explanation}</p>}
          </div>
        ))}
        {!!problem.learning_objectives.length && (
          <section className="mt-5" aria-labelledby="problem-learning-objectives">
            <h2 id="problem-learning-objectives" className="text-sm font-semibold text-ink-900 dark:text-white">What you’ll practice</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600 dark:text-ink-200">{problem.learning_objectives.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}
        {!!problem.acceptance_criteria.length && (
          <section className="mt-5" aria-labelledby="problem-acceptance-criteria">
            <h2 id="problem-acceptance-criteria" className="text-sm font-semibold text-ink-900 dark:text-white">Before you submit</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600 dark:text-ink-200">{problem.acceptance_criteria.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}
        {!!problem.hints.length && (
          <details className="mt-5 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
            <summary className="cursor-pointer text-sm font-semibold text-ink-900 dark:text-white">Need a hint?</summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-600 dark:text-ink-200">{problem.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol>
          </details>
        )}
      </aside>
    </ErrorBoundary>
  )

  return (
    <div>
      {error && <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8"><ErrorState message={error} /></div>}
      <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">{statement}</div>
      <CodingWorkspace
        eyebrow="Problem"
        title={problem.title}
        subtitle="Run locally without logging in. Submit when you are ready."
        languages={[{ id: problem.language, label: problem.language === 'web' ? 'Web Development' : 'Python', monacoId: problem.language === 'web' ? 'html' : 'python', mainFile: problem.language === 'web' ? 'index.html' : 'main.py' }]}
        language={problem.language}
        onLanguageChange={() => {}}
        files={files}
        selectedFile={selectedFile}
        onSelectFile={setSelectedFile}
        onFileChange={handleFileChange}
        stdin={stdin}
        onStdinChange={setStdin}
        runner={runner}
        onSave={handleSubmit}
        saving={submitting}
        saveLabel="Submit"
        scrollIntoViewOnOpen={false}
      />
      {runner.result?.status === 'success' && (
        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600">
            <FiCheckCircle className="h-4 w-4" /> Local run completed.
          </p>
          <FiSend className="sr-only" />
        </div>
      )}
    </div>
  )
}
