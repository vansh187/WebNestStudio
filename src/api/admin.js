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
export const adminCodelabProblems = crudResource('codelab/problems')

// Client project status (upsert)
export const upsertProjectStatus = (clientUserId, payload) =>
  api.put(`/api/admin/project-status/${clientUserId}`, payload).then((r) => r.data)

// Course catalog on the server (structure only; COURSE_EXAMS_CERTIFICATES.md §1).
export const upsertLearningCourse = (payload) =>
  api.put('/api/admin/learning/courses', payload).then((r) => r.data)
export const uploadExamContext = (slug, modules) =>
  api.put(`/api/admin/learning/courses/${slug}/exam-context`, { modules }).then((r) => r.data)

// Course final exams: the question pool and certificates (COURSE_EXAMS_CERTIFICATES.md §7).
export const getExamBankSummary = (course) =>
  api.get('/api/admin/learning/exam-questions/summary', { params: { course } }).then((r) => r.data)
export const listExamQuestions = (params) =>
  api.get('/api/admin/learning/exam-questions', { params }).then((r) => r.data)
export const updateExamQuestion = (id, payload) =>
  api.put(`/api/admin/learning/exam-questions/${id}`, payload).then((r) => r.data)
export const createExamQuestion = (payload) =>
  api.post('/api/admin/learning/exam-questions', payload).then((r) => r.data)
export const voidExamQuestion = (id) =>
  api.post(`/api/admin/learning/exam-questions/${id}/void`).then((r) => r.data)
export const setCourseExam = (courseSlug, payload) =>
  api.put(`/api/admin/learning/courses/${courseSlug}/exam`, payload).then((r) => r.data)
export const refillExamPool = (courseSlug) =>
  api.post(`/api/admin/learning/exams/${courseSlug}/refill`).then((r) => r.data)
export const getExamJob = (jobId) =>
  api.get(`/api/admin/learning/exams/jobs/${jobId}`).then((r) => r.data)
export const listAdminCertificates = (q) =>
  api.get('/api/admin/certificates', { params: { q } }).then((r) => r.data)
export const revokeCertificate = (id, reason) =>
  api.post(`/api/admin/certificates/${encodeURIComponent(id)}/revoke`, { reason }).then((r) => r.data)
export const reissueCertificate = (id, recipientName) =>
  api.post(`/api/admin/certificates/${encodeURIComponent(id)}/reissue`, { recipient_name: recipientName }).then((r) => r.data)
