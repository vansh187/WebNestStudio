import { useCallback, useEffect, useState } from 'react'
import {
  getServicesPreview,
  getFeaturedWork,
  getTestimonials,
  getProjectStatusDemo,
  getStats,
} from '../api/home'
import { getErrorDetail } from '../lib/apiClient'

const FETCHERS = {
  services: () => getServicesPreview(4),
  featuredWork: () => getFeaturedWork(6),
  testimonials: () => getTestimonials(6),
  projectStatus: () => getProjectStatusDemo(),
  stats: () => getStats(),
}

const KEYS = Object.keys(FETCHERS)

function initialState() {
  return Object.fromEntries(KEYS.map((k) => [k, { status: 'loading', data: null, error: null }]))
}

// Each section loads independently (in parallel) so a single failing endpoint never
// blocks the rest of the home page from rendering.
export function useHomeData() {
  const [state, setState] = useState(initialState)

  const load = useCallback((keys = KEYS) => {
    keys.forEach((key) => {
      setState((prev) => ({ ...prev, [key]: { status: 'loading', data: null, error: null } }))
      FETCHERS[key]()
        .then((data) => setState((prev) => ({ ...prev, [key]: { status: 'success', data, error: null } })))
        .catch((error) =>
          setState((prev) => ({
            ...prev,
            [key]: { status: 'error', data: null, error: getErrorDetail(error, 'Could not load this section.') },
          }))
        )
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { state, reload: load }
}
