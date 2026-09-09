import { api } from '../lib/apiClient'

export const listCourses = () => api.get('/api/courses').then((r) => r.data)
export const getCourse = (slug) => api.get(`/api/courses/${slug}`).then((r) => r.data)
export const getLesson = (id) => api.get(`/api/lessons/${id}`).then((r) => r.data)
export const updateLessonProgress = (id, body) => api.post(`/api/lessons/${id}/progress`, body).then((r) => r.data)
export const toggleLessonBookmark = (id, body) => api.post(`/api/lessons/${id}/bookmark`, body).then((r) => r.data)
export const saveLessonNote = (id, body) => api.post(`/api/lessons/${id}/notes`, body).then((r) => r.data)
export const submitQuiz = (id, body) => api.post(`/api/quizzes/${id}/submit`, body).then((r) => r.data)
export const getLearningDashboard = () => api.get('/api/dashboard/learning').then((r) => r.data)
