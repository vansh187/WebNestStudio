import { Link } from 'react-router-dom'
import { lessonTemplate } from '../../lib/lessonPlayground'
import { trackEvent } from '../../lib/analytics'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useCodeRunner } from '../../hooks/useCodeRunner'
import CodingWorkspace from '../../components/coding/CodingWorkspace'
import { LANGUAGES, getLanguage, mainFileName } from '../../data/codingLanguages'
import { WEB_FILES, PYTHON_FILES, cloneFiles, SAMPLE_LESSONS } from '../../data/codelabDefaults'
import { createProject, createShare, toCodePayload } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'

const STORAGE_KEY = 'wns-codelab-playground'

function loadSession(key = STORAGE_KEY) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.language === 'string') {
      const language = parsed.language === 'javascript' ? 'web' : parsed.language
      const fallback = language === 'web' ? WEB_FILES : PYTHON_FILES
      return {
        language,
        source: parsed.source ?? '',
        files: cloneFiles(parsed.files, fallback),
        selectedFile: parsed.selectedFile,
        stdin: parsed.stdin ?? '',
      }
    }
  } catch {
    return null
  }
  return null
}

export default function Playground() {
  const location = useLocation()
  return <PlaygroundEditor key={location.search} />
}

function PlaygroundEditor() {
  useSeo({
    title: 'Online Python and Web Coding Playground',
    description:
      'Write and run HTML, CSS, JavaScript and Python in the browser with Webnest CodeLab.',
    path: '/codelab/playground',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const runner = useCodeRunner()

  const templateId = new URLSearchParams(location.search).get('lesson')
  const exampleIndex = Number(new URLSearchParams(location.search).get('example') || 0)
  const templateLesson = SAMPLE_LESSONS[templateId]
  const template = useMemo(() => lessonTemplate(templateLesson, exampleIndex), [templateLesson, exampleIndex])
  const storageKey = template ? `${STORAGE_KEY}:lesson:${template.lessonId}:${exampleIndex}` : STORAGE_KEY
  const session = useMemo(() => loadSession(storageKey) || template, [storageKey, template])
  const [language, setLanguage] = useState(session?.language ?? 'web')
  const [files, setFiles] = useState(session?.files ?? cloneFiles(WEB_FILES, WEB_FILES))
  const [selectedFile, setSelectedFile] = useState(session?.selectedFile ?? files[0]?.name ?? 'index.html')
  const [source, setSource] = useState(session?.source ?? getLanguage(session?.language ?? 'web').defaultSnippet)
  const [stdin, setStdin] = useState(session?.stdin ?? '')
  const [touched, setTouched] = useState(Boolean(session))
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ language, source, files, selectedFile, stdin }))
    } catch {
      /* Storage can fail in private mode; the editor should keep working. */
    }
  }, [language, source, files, selectedFile, stdin, storageKey])

  useEffect(() => {
    trackEvent('codelab_opened', { source: template ? 'lesson' : 'playground', ...(template ? { lesson_id: template.lessonId } : {}) })
  }, [template])

  const handleLanguageChange = useCallback(
    (next) => {
      setLanguage(next)
      if (!touched) {
        const snippet = getLanguage(next).defaultSnippet
        if (snippet != null) setSource(snippet)
      }
      const nextFiles = next === 'web' ? cloneFiles(WEB_FILES, WEB_FILES) : cloneFiles(PYTHON_FILES, PYTHON_FILES)
      setFiles(nextFiles)
      setSelectedFile(nextFiles[0]?.name ?? 'main.py')
    },
    [touched],
  )

  const handleSourceChange = useCallback((value) => {
    setTouched(true)
    setSource(value)
  }, [])

  const handleFileChange = useCallback((fileName, value) => {
    setTouched(true)
    setFiles((items) => items.map((file) => (file.name === fileName ? { ...file, content: value } : file)))
  }, [])

  const requireLogin = useCallback(
    (message) => {
      toast.info(message)
      navigate('/login', { state: { from: location } })
    },
    [toast, navigate, location],
  )

  const currentLang = useCallback(() => getLanguage(language), [language])

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin('Log in to save your CodeLab project.')
      return
    }
    setSaving(true)
    try {
      const lang = currentLang()
      const activeSource = files.find((file) => file.name === selectedFile)?.content ?? source
      const project = await createProject({
        title: 'Untitled CodeLab project',
        language,
        ...toCodePayload({
          source: activeSource,
          fileName: mainFileName(lang),
          files,
          extra: { stdin },
        }),
      })
      toast.success('CodeLab project created.')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not save your CodeLab project.'))
    } finally {
      setSaving(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, files, selectedFile, stdin, toast, navigate])

  const handleShare = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin('Log in to share your CodeLab work.')
      return
    }
    setSharing(true)
    try {
      const lang = currentLang()
      const activeSource = files.find((file) => file.name === selectedFile)?.content ?? source
      const { url } = await createShare({
        language,
        ...toCodePayload({
          source: activeSource,
          fileName: mainFileName(lang),
          files,
          extra: { stdin, stdout: runner.result?.stdout },
        }),
      })
      const fullUrl = `${window.location.origin}${url}`
      try {
        await navigator.clipboard.writeText(fullUrl)
      } catch {
        /* Clipboard can be blocked; sharing still succeeded. */
      }
      toast.success('Share link copied to clipboard.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not create a share link.'))
    } finally {
      setSharing(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, files, selectedFile, stdin, runner.result, toast])

  return (
    <>
    {templateLesson && <p className="mx-auto max-w-7xl px-6 pt-6 text-sm"><Link className="underline" to={`/learn/lessons/${templateLesson.id}`}>Back to {templateLesson.title}</Link> - Example loaded for practice. Some snippets need input, additional markup or dependencies; edit before running.</p>}
    <CodingWorkspace
      eyebrow="Webnest CodeLab"
      title="Browser coding playground"
      subtitle="Run Web projects and Python locally in your browser. No compiler server needed."
      languages={LANGUAGES}
      language={language}
      onLanguageChange={handleLanguageChange}
      source={source}
      onSourceChange={handleSourceChange}
      files={files}
      selectedFile={selectedFile}
      onSelectFile={setSelectedFile}
      onFileChange={handleFileChange}
      stdin={stdin}
      onStdinChange={setStdin}
      runner={runner}
      onSave={handleSave}
      saving={saving}
      saveLabel="Save project"
      onShare={handleShare}
      sharing={sharing}
    />
    </>
  )
}
