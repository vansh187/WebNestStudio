import { api } from '../lib/apiClient'

export const getServicesPreview = (limit = 4) =>
  api.get('/api/home/services-preview', { params: { limit } }).then((r) => r.data)

export const getFeaturedWork = (limit = 6) =>
  api.get('/api/home/featured-work', { params: { limit } }).then((r) => r.data)

export const getTestimonials = (limit = 6) =>
  api.get('/api/home/testimonials', { params: { limit } }).then((r) => r.data)

export const getProjectStatusDemo = () =>
  api.get('/api/home/project-status-demo').then((r) => r.data)

export const getStats = () => api.get('/api/home/stats').then((r) => r.data)
