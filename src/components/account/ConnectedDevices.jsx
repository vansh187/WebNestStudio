import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiClock, FiMonitor, FiRefreshCw, FiShield, FiTrash2 } from 'react-icons/fi'
import { disconnectVscodeDevice, listVscodeDevices } from '../../api/vscode'
import { getErrorDetail } from '../../lib/apiClient'

function dateLabel(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ConnectedDevices() {
  const [devices, setDevices] = useState(null)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setDevices(null)
    setError('')
    listVscodeDevices()
      .then((items) => { if (!cancelled) setDevices(items) })
      .catch((err) => {
        if (!cancelled) {
          setDevices([])
          setError(getErrorDetail(err, 'Could not load connected devices.'))
        }
      })
    return () => { cancelled = true }
  }, [reload])

  const disconnect = async (device) => {
    setBusyId(device.id)
    setError('')
    try {
      await disconnectVscodeDevice(device.id)
      setDevices((current) => current.filter((item) => item.id !== device.id))
      setConfirmingId(null)
    } catch (err) {
      setError(getErrorDetail(err, `Could not disconnect ${device.name}.`))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 p-5 dark:border-ink-800 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007acc]/10 text-[#007acc] dark:bg-[#007acc]/20 dark:text-sky-300">
            <FiMonitor className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-white">Visual Studio Code</h3>
            <p className="mt-1 max-w-xl text-sm text-ink-500 dark:text-ink-300">
              Devices connected to your WebNest account can access your CodeLab workspace.
            </p>
          </div>
        </div>
        <Link to="/vscode/connect" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300">
          Connect VS Code <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
            <span>{error}</span>
            {devices?.length === 0 && (
              <button type="button" onClick={() => setReload((value) => value + 1)} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
                <FiRefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            )}
          </div>
        )}

        {devices === null ? (
          <div role="status" className="space-y-3">
            <div className="h-14 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
            <div className="h-14 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
            <span className="sr-only">Loading connected devices</span>
          </div>
        ) : devices.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-ink-200 px-5 py-8 text-center dark:border-ink-700">
            <FiShield className="mx-auto h-7 w-7 text-ink-300 dark:text-ink-600" />
            <p className="mt-3 font-semibold text-ink-800 dark:text-ink-100">No connected devices yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-500 dark:text-ink-300">
              Connect the WebNest extension in VS Code to continue your CodeLab work from your editor.
            </p>
          </div>
        ) : devices.length > 0 ? (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {devices.map((device) => (
              <li key={device.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500 dark:bg-ink-950 dark:text-ink-300">
                      <FiMonitor className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{device.name}</p>
                        {device.current && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><FiCheck className="h-3 w-3" /> This device</span>}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-500 dark:text-ink-400">
                        <span>{device.platform}</span>
                        {dateLabel(device.lastSeenAt || device.connectedAt) && (
                          <span className="inline-flex items-center gap-1"><FiClock className="h-3 w-3" /> Last active {dateLabel(device.lastSeenAt || device.connectedAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmingId((current) => current === device.id ? null : device.id)}
                    disabled={busyId === device.id}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-ink-300 dark:hover:bg-red-400/10 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" /> Disconnect
                  </button>
                </div>
                {confirmingId === device.id && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50 px-4 py-3 dark:bg-ink-950">
                    <p className="text-sm text-ink-600 dark:text-ink-300">Disconnect this device from your account?</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setConfirmingId(null)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200 dark:text-ink-200 dark:hover:bg-ink-800">Cancel</button>
                      <button type="button" onClick={() => disconnect(device)} disabled={busyId === device.id} className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">{busyId === device.id ? 'Disconnecting…' : 'Confirm disconnect'}</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
