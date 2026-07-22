import { api } from '../lib/apiClient'

// Leads (CRM-lite)
export const getLeads = ({ source, status_filter, limit = 50, offset = 0 } = {}) =>
  api
    .get('/api/admin/leads', { params: { source, status_filter, limit, offset } })
    .then((r) => r.data)

export const updateLeadStatus = (leadId, status) =>
  api.put(`/api/admin/leads/${leadId}`, { status }).then((r) => r.data)

// Generic CRUD factory — services, portfolio, testimonials, faqs, and blog all follow the
// same GET/POST/PUT/DELETE shape under /api/admin/<resource>.
function crudResource(resource) {
  return {
    list: () => api.get(`/api/admin/${resource}`).then((r) => r.data),
    create: (payload) => api.post(`/api/admin/${resource}`, payload).then((r) => r.data),
    update: (id, payload) => api.put(`/api/admin/${resource}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/api/admin/${resource}/${id}`).then((r) => r.data),
  }
}

export const adminServices = crudResource('services')
export const adminPortfolio = crudResource('portfolio')
export const adminTestimonials = crudResource('testimonials')
export const adminFaqs = crudResource('faqs')
export const adminBlog = crudResource('blog')

// Client project status (upsert)
export const upsertProjectStatus = (clientUserId, payload) =>
  api.put(`/api/admin/project-status/${clientUserId}`, payload).then((r) => r.data)
