import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo'
import { useToast } from '../../context/ToastContext'
import { useCodeRunner } from '../../hooks/useCodeRunner'
import { useAutosave } from '../../hooks/useAutosave'
import CodingWorkspace from '../../components/coding/CodingWorkspace'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { PROJECT_LANGUAGES, getLanguage, mainFileName } from '../../data/codingLanguages'
import { getProject, updateProject, createShare, toCodePayload } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'
import { isJavaFile } from '../../lib/codelab/javaProject'
import { languageForFile } from '../../lib/codelab/backendFiles'

// Java and Web projects keep every file; Python stays single-file.
const isMultiFile = (language) => language === 'java' || language === 'web'

// A one-file list for a multi-file language (null for single-file ones), so the file list
// always exists while such a language is selected.
function seedFiles(language, content) {
  if (!isMultiFile(language)) return null
  const lang = getLanguage(language)
  return [{ name: mainFileName(lang), language: lang.monacoId, content }]
}

function savedFiles(data) {
  const saved = data.files ?? []
  const kept = data.language === 'java' ? saved.filter(isJavaFile) : data.language === 'web' ? saved : []
  return kept.length
    ? kept.map((file) => ({ name: file.name, language: data.language === 'java' ? 'java' : languageForFile(file.name), content: file.content ?? '' }))
    : seedFiles(data.language, data.source ?? '')
}

function SaveStatus({ status }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400">
        <FiLoader className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
        <FiCheck className="h-3.5 w-3.5" /> Saved
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
        <FiAlertCircle className="h-3.5 w-3.5" /> Save failed — retry with Ctrl/⌘+S
      </span>
    )
  }
  return null
}

export default function ProjectWorkspace() {
  const { id } = useParams()
  const toast = useToast()
  const runner = useCodeRunner()

  const [languages] = useState(PROJECT_LANGUAGES)
  const [project, setProject] = useState(undefined) // undefined = loading, null = not found
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('web')
  const [source, setSource] = useState('')
  const [stdin, setStdin] = useState('')
  const [fileName, setFileName] = useState('')
  // Java projects keep every class file and Web projects every HTML/CSS/JS file; Python
  // stays single-file.
  const [projectFiles, setProjectFiles] = useState(null)
  const [selectedFile, setSelectedFile] = useState('')
  const [sharing, setSharing] = useState(false)

  useSeo({ title: title ? `${title} - CodeLab Project` : 'CodeLab Project', noindex: true, path: `/projects/${id}` })

  useEffect(() => {
    let cancelled = false
    setProject(undefined)
    setError(null)
    getProject(id)
      .then((data) => {
        if (cancelled) return
        setProject(data)
        setTitle(data.title ?? 'Untitled project')
        setLanguage(data.language ?? 'web')
        setSource(data.files?.[0]?.content ?? data.source ?? '')
        setStdin(data.stdin ?? '')
        setFileName(data.files?.[0]?.name ?? '')
        const kept = savedFiles(data)
        setProjectFiles(kept)
        setSelectedFile(kept?.[0]?.name ?? '')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) setProject(null)
        else setError(getErrorDetail(err, 'Could not load this project.'))
      })
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  const lang = languages.find((l) => l.id === language) ?? getLanguage(language)
  // Keep the backend's original file name only while it still matches the current
  // language; once the user switches language, use that language's canonical name
  // so the persisted file / run entrypoint don't drift apart.
  const ext = lang?.fileExtension ? `.${lang.fileExtension.toLowerCase()}` : ''
  const currentFileName =
    fileName && ext && fileName.toLowerCase().endsWith(ext) ? fileName : mainFileName(lang)

  const files = isMultiFile(language) ? projectFiles ?? [] : undefined
  const activeSource = files ? files[0]?.content ?? '' : source

  const autosaveValue = useMemo(
    () => ({ title, language, ...toCodePayload({ source: activeSource, fileName: currentFileName, files, extra: { stdin } }) }),
    [title, language, stdin, activeSource, currentFileName, files],
  )

  const handleFileChange = useCallback((name, value) => {
    setProjectFiles((items) => (items ?? []).map((file) => (file.name === name ? { ...file, content: value } : file)))
  }, [])

  // Changing language keeps only the main file's latest code, so neither side restores stale
  // code. Autosave would then write that loss to the server, so ask first when other files
  // (a Web project's CSS and JS, extra Java classes) would be removed.
  const handleLanguageChange = useCallback((next) => {
    if (next === language) return
    const main = files ? files[0] : null
    if (files && files.length > 1) {
      const others = files.slice(1).map((file) => file.name).join(', ')
      const label = getLanguage(next).label
      if (!window.confirm(`Switching to ${label} keeps only ${main.name} and removes ${others} from this project. Continue?`)) return
    }
    const content = main ? main.content : source
    setSource(content)
    setProjectFiles(seedFiles(next, content))
    setSelectedFile('')
    setLanguage(next)
  }, [language, files, source])

  const { status: saveStatus, flush: saveNow } = useAutosave(autosaveValue, (val) => updateProject(id, val), {
    enabled: Boolean(project),
  })

  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      const { url } = await createShare({
        project_id: id,
        title,
        language,
        ...toCodePayload({
          source: activeSource,
          fileName: currentFileName,
          files,
          extra: { stdin, stdout: runner.result?.stdout },
        }),
      })
      const fullUrl = `${window.location.origin}${url}`
      try {
        await navigator.clipboard.writeText(fullUrl)
      } catch {
        /* clipboard blocked */
      }
      toast.success('Share link copied to clipboard.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not create a share link.'))
    } finally {
      setSharing(false)
    }
  }, [id, title, language, currentFileName, activeSource, files, stdin, runner.result, toast])

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <BackButton fallback="/projects" label="Back to projects" className="mb-6" />
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      </div>
    )
  }

  if (project === null) {
    return (
      <NotFoundState
        title="Project not found"
        description="This project may have been deleted, or the link is wrong."
        backTo="/projects"
        backLabel="Back to projects"
      />
    )
  }

  if (project === undefined) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <BackButton fallback="/projects" label="Back to projects" className="mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-12 w-full" />
        <Skeleton className="mt-3 h-[45dvh] w-full" />
      </div>
    )
  }

  return (
    <CodingWorkspace
      eyebrow="Project"
      titleField={
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled project"
          aria-label="Project title"
          className="w-full rounded-lg border border-transparent bg-transparent font-display text-2xl font-bold text-ink-900 outline-none focus:border-ink-200 focus:px-3 focus:py-1 dark:text-white dark:focus:border-ink-700"
        />
      }
      headerRight={<SaveStatus status={saveStatus} />}
      beforeDebugReload={saveNow}
      languages={languages}
      language={language}
      onLanguageChange={handleLanguageChange}
      source={source}
      onSourceChange={setSource}
      files={files}
      selectedFile={files?.some((file) => file.name === selectedFile) ? selectedFile : files?.[0]?.name}
      onSelectFile={setSelectedFile}
      onFileChange={handleFileChange}
      onFilesChange={setProjectFiles}
      stdin={stdin}
      onStdinChange={setStdin}
      runner={runner}
      onShare={handleShare}
      sharing={sharing}
    />
  )
}
