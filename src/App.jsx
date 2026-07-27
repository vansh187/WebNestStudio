import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { FiLoader } from 'react-icons/fi'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SlowRequestBanner from './components/SlowRequestBanner'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import PortfolioDetail from './pages/PortfolioDetail'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Faqs from './pages/Faqs'
import Contact from './pages/Contact'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Auth-gated, never needed by anonymous visitors or crawlers - split out of the
// main bundle so public/marketing pages don't pay for admin+portal code weight.
const ClientPortal = lazy(() => import('./pages/portal/ClientPortal'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'))
const AdminResourceCrud = lazy(() => import('./pages/admin/AdminResourceCrud'))
const AdminProjectStatus = lazy(() => import('./pages/admin/AdminProjectStatus'))

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <FiLoader className="h-6 w-6 animate-spin text-gold-500" />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Analytics />
          <SlowRequestBanner />
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="services" element={<Services />} />
                  <Route path="portfolio" element={<Portfolio />} />
                  <Route path="portfolio/:slug" element={<PortfolioDetail />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogDetail />} />
                  <Route path="faqs" element={<Faqs />} />
                  <Route path="contact" element={<Contact />} />
                  <Route
                    path="portal"
                    element={(
                      <ProtectedRoute roles={['client', 'admin']}>
                        <ClientPortal />
                      </ProtectedRoute>
                    )}
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="login" element={<Login />} />

                <Route
                  path="admin"
                  element={(
                    <ProtectedRoute roles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  )}
                >
                  <Route index element={<AdminLeads />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="project-status" element={<AdminProjectStatus />} />
                  <Route path=":resource" element={<AdminResourceCrud />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
