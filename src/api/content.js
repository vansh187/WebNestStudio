import { api } from '../lib/apiClient'

export const getServices = () => api.get('/api/services').then((r) => r.data)

export const getPortfolio = (category) =>
  api.get('/api/portfolio', { params: category ? { category } : {} }).then((r) => r.data)

export const getPortfolioBySlug = (slug) =>
  api.get(`/api/portfolio/${slug}`).then((r) => r.data)

export const getBlogPosts = (tag) =>
  api.get('/api/blog', { params: tag ? { tag } : {} }).then((r) => r.data)

export const getBlogPostBySlug = (slug) => api.get(`/api/blog/${slug}`).then((r) => r.data)

export const getFaqs = (category) =>
  api.get('/api/faqs', { params: category ? { category } : {} }).then((r) => r.data)
