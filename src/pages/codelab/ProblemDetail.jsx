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
  const source = data?.id || data?.slug ? data : sample
  if (!source) return null
  return {
    id: source.id || source.slug,
    slug: source.slug || slug,
    title: source.title || 'Untitled problem',
    statement: source.statement || '',
    language: source.language || source.track || 'python',
    difficulty: source.difficulty || 'easy',
    points: Number(source.points || 0),
    examples: Array.isArray(source.examples) ? source.examples : [],
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

  useSeo({ title: problem?.title ? `${problem.title} | CodeLab` : 'CodeLab Problem', description: 'Solve a Webnest CodeLab problem.', path: `/codelab/problems/${slug || ''}` })

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
          setError(next ? getErrorDetail(err, 'Could not load the live problem. Showing starter content.') : '')
        }
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

  if (!problem) return <NotFoundState title="Problem not found" backTo="/codelab/problems" backLabel="Back to problems" />

  const statement = (
    <ErrorBoundary>
      <aside className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
          <span>{problem.difficulty}</span>
          <span>{problem.points} XP</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink-600 dark:text-ink-200">{problem.statement}</p>
        {problem.examples.map((example, index) => (
          <div key={`${example.input}-${index}`} className="mt-4 rounded-lg bg-ink-50 p-3 dark:bg-ink-950">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Example</p>
            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-ink-700 dark:text-ink-100">Input: {example.input || '(none)'}Expected: {example.expected_output || '(none)'}</pre>
          </div>
        ))}
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
