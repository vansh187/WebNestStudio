import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useCodeRunner } from '../../hooks/useCodeRunner'
import CodingWorkspace from '../../components/coding/CodingWorkspace'
import { LANGUAGES, getLanguage, mainFileName } from '../../data/codingLanguages'
import { listLanguages, createProject, createShare, toCodePayload } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'

const STORAGE_KEY = 'wns-playground'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.source === 'string' && typeof parsed.language === 'string') {
      return { language: parsed.language, source: parsed.source, stdin: parsed.stdin ?? '' }
    }
  } catch {
    /* private mode / corrupt value — fall through */
  }
  return null
}

export default function Playground() {
  useSeo({
    title: 'Online Compiler & Playground',
    description:
      'Write, run and share code in Python, JavaScript, Java and more — right in your browser. No install, no setup.',
    path: '/playground',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const runner = useCodeRunner()

  const session = useMemo(loadSession, [])
  const [languages, setLanguages] = useState(LANGUAGES)
  const [language, setLanguage] = useState(session?.language ?? 'python')
  const [source, setSource] = useState(session?.source ?? getLanguage(session?.language ?? 'python').defaultSnippet)
  const [stdin, setStdin] = useState(session?.stdin ?? '')
  const [touched, setTouched] = useState(Boolean(session))
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    let cancelled = false
    listLanguages()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setLanguages(data)
      })
      .catch(() => {
        /* keep the bundled fallback list */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, source, stdin }))
    } catch {
      /* ignore quota / private mode */
    }
  }, [language, source, stdin])

  const handleLanguageChange = useCallback(
    (next) => {
      setLanguage(next)
      if (!touched) {
        const snippet = (languages.find((l) => l.id === next) ?? getLanguage(next)).defaultSnippet
        if (snippet != null) setSource(snippet)
      }
    },
    [touched, languages],
  )

  const handleSourceChange = useCallback((value) => {
    setTouched(true)
    setSource(value)
  }, [])

  const requireLogin = useCallback(
    (message) => {
      toast.info(message)
      navigate('/login', { state: { from: location } })
    },
    [toast, navigate, location],
  )

  const currentLang = useCallback(
    () => languages.find((l) => l.id === language) ?? getLanguage(language),
    [languages, language],
  )

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin('Log in to save your project.')
      return
    }
    setSaving(true)
    try {
      const lang = currentLang()
      const project = await createProject({
        title: 'Untitled project',
        language,
        ...toCodePayload({ source, fileName: mainFileName(lang), extra: { stdin } }),
      })
      toast.success('Project created.')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not save your project.'))
    } finally {
      setSaving(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, stdin, toast, navigate])

  const handleShare = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin('Log in to share your code.')
      return
    }
    setSharing(true)
    try {
      const lang = currentLang()
      const { url } = await createShare({
        language,
        ...toCodePayload({
          source,
          fileName: mainFileName(lang),
          extra: { stdin, stdout: runner.result?.stdout },
        }),
      })
      const fullUrl = `${window.location.origin}${url}`
      try {
        await navigator.clipboard.writeText(fullUrl)
      } catch {
        /* clipboard blocked — the toast still tells them it worked */
      }
      toast.success('Share link copied to clipboard.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not create a share link.'))
    } finally {
      setSharing(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, stdin, runner.result, toast])

  return (
    <CodingWorkspace
      eyebrow="Playground"
      title="Online compiler"
      subtitle="Write code, run it, and share the result. No account needed to run."
      languages={languages}
      language={language}
      onLanguageChange={handleLanguageChange}
      source={source}
      onSourceChange={handleSourceChange}
      stdin={stdin}
      onStdinChange={setStdin}
      runner={runner}
      onSave={handleSave}
      saving={saving}
      saveLabel="Save as project"
      onShare={handleShare}
      sharing={sharing}
    />
  )
}
