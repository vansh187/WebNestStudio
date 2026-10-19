import { api } from '../lib/apiClient'

// Learning API. Paths match the backend's /api/learning module (see GET /openapi.json).
// Final exams and certificates follow COURSE_EXAMS_CERTIFICATES.md.

export const listCourses = () => api.get('/api/learning/courses').then((r) => r.data)
export const getCourse = (slug) => api.get(`/api/learning/courses/${slug}`).then((r) => r.data)
export const getLesson = (id) => api.get(`/api/learning/lessons/${id}`).then((r) => r.data)
export const updateLessonProgress = (id, body) => api.put(`/api/learning/lessons/${id}/progress`, body).then((r) => r.data)
export const toggleLessonBookmark = (id, body) => api.put(`/api/learning/lessons/${id}/bookmark`, body).then((r) => r.data)
export const saveLessonNote = (id, body) => api.put(`/api/learning/lessons/${id}/note`, body).then((r) => r.data)
export const submitQuiz = (id, body) => api.post(`/api/learning/quizzes/${id}/submit`, body).then((r) => r.data)
export const getLearningDashboard = () => api.get('/api/learning/dashboard').then((r) => r.data)

// Sends lessons completed in this browser so the server can check exam eligibility.
export const bulkUpdateProgress = (lessons) => api.post('/api/learning/progress/bulk', { lessons }).then((r) => r.data)

// Final exam: eligibility, then one timed attempt that the server draws, times and grades.
export const getCourseExam = (slug) => api.get(`/api/learning/courses/${slug}/exam`).then((r) => r.data)
export const startExamAttempt = (slug, body) => api.post(`/api/learning/courses/${slug}/exam/attempts`, body).then((r) => r.data)
export const getExamAttempt = (id) => api.get(`/api/learning/exam-attempts/${id}`).then((r) => r.data)
export const saveExamAnswers = (id, body) => api.put(`/api/learning/exam-attempts/${id}/answers`, body).then((r) => r.data)
export const submitExamAttempt = (id) => api.post(`/api/learning/exam-attempts/${id}/submit`).then((r) => r.data)
// Keeps the server awake during an exam (Render's free tier sleeps when idle).
export const pingExamAttempt = (id) => api.get(`/api/learning/exam-attempts/${id}/ping`).then((r) => r.data)

// The server lost an attempt's questions after a crash: the learner starts again with new
// questions and a fresh timer, and it does not count as a fail.
export const isAttemptLost = (err) => err?.response?.status === 409 && err.response.data?.code === 'attempt_lost'

// Certificates: the learner's own list, and the public verification record.
export const listMyCertificates = () => api.get('/api/me/certificates').then((r) => r.data)
export const getCertificate = (id) => api.get(`/api/certificates/${encodeURIComponent(id)}`).then((r) => r.data)
export const certificatePdfUrl = (id) => `${api.defaults.baseURL}/api/certificates/${encodeURIComponent(id)}/pdf`
