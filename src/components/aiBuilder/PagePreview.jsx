export default function PagePreview({ html }) {
  if (!html) return null
  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts"
      className="w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white"
      style={{ height: '360px' }}
      title="Generated page preview"
    />
  )
}
