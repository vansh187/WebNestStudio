import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { FiLoader, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SlowRequestBanner from './components/SlowRequestBanner'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import About from './pages/About'
import OurStory from './pages/OurStory'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import PortfolioDetail from './pages/PortfolioDetail'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Faqs from './pages/Faqs'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DeleteAccount from './pages/DeleteAccount'
import AccountDeletion from './pages/AccountDeletion'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Split out of the main bundle - only visitors who actually open /card should
// pay for the QR-code library it pulls in.
const DigitalCard = lazy(() => import('./pages/DigitalCard'))

// Coding platform - Monaco + its language workers are heavy, and only visitors who
// open the playground / a project should pay for that chunk. Lazy for the same reason
// as /card and admin below.
const Playground = lazy(() => import('./pages/coding/Playground'))
const ProjectsList = lazy(() => import('./pages/coding/ProjectsList'))
const ProjectWorkspace = lazy(() => import('./pages/coding/ProjectWorkspace'))
const SharedSnippet = lazy(() => import('./pages/coding/SharedSnippet'))
const CodeLabHome = lazy(() => import('./pages/codelab/CodeLabHome'))
const ProblemsList = lazy(() => import('./pages/codelab/ProblemsList'))
const ProblemDetail = lazy(() => import('./pages/codelab/ProblemDetail'))
const LearnerDashboard = lazy(() => import('./pages/codelab/LearnerDashboard'))
const CoursesList = lazy(() => import('./pages/learn/CoursesList'))
const CourseDetail = lazy(() => import('./pages/learn/CourseDetail'))
const LessonDetail = lazy(() => import('./pages/learn/LessonDetail'))

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

// Last-resort safety net so a render error anywhere in the tree shows a real
// recovery UI instead of a blank white page in production.
function AppCrashedFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center dark:bg-ink-950">
      <FiAlertTriangle className="h-10 w-10 text-red-500" />
      <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Something went wrong.</p>
      <p className="max-w-sm text-sm text-ink-500 dark:text-ink-300">
        Please reload the page. If this keeps happening, try again in a few minutes.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950"
      >
        <FiRefreshCw className="h-4 w-4" /> Reload
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={() => <AppCrashedFallback />}>
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
                    <Route path="our-story" element={<OurStory />} />
                    <Route path="services" element={<Services />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="portfolio/:slug" element={<PortfolioDetail />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:slug" element={<BlogDetail />} />
                    <Route path="faqs" element={<Faqs />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    {/* Public, no-login-required page - required by Google Play's account
                        deletion policy so someone who lost app/website access can still
                        request deletion. The Android app links here. Distinct from
                        /delete-account below, which is the in-session self-service flow
                        for the website's own logged-in portal users. */}
                    <Route path="account-deletion" element={<AccountDeletion />} />
                    <Route
                      path="delete-account"
                      element={(
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <DeleteAccount />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="codelab"
                      element={(
                        <ErrorBoundary>
                          <CodeLabHome />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="codelab/playground"
                      element={(
                        <ErrorBoundary>
                          <Playground />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="codelab/problems"
                      element={(
                        <ErrorBoundary>
                          <ProblemsList />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="codelab/problems/:slug"
                      element={(
                        <ErrorBoundary>
                          <ProblemDetail />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="codelab/dashboard"
                      element={(
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <LearnerDashboard />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="learn"
                      element={(
                        <ErrorBoundary>
                          <CoursesList />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="learn/:courseSlug"
                      element={(
                        <ErrorBoundary>
                          <CourseDetail />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="learn/lessons/:lessonId"
                      element={(
                        <ErrorBoundary>
                          <LessonDetail />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="playground"
                      element={<Navigate to="/codelab/playground" replace />}
                    />
                    <Route
                      path="s/:shareId"
                      element={(
                        <ErrorBoundary>
                          <SharedSnippet />
                        </ErrorBoundary>
                      )}
                    />
                    <Route
                      path="projects"
                      element={(
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <ProjectsList />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="projects/:id"
                      element={(
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <ProjectWorkspace />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="portal"
                      element={(
                        <ProtectedRoute roles={['client', 'admin']}>
                          <ErrorBoundary>
                            <ClientPortal />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  <Route path="login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                  <Route
                    path="card"
                    element={(
                      <ErrorBoundary fallback={() => <AppCrashedFallback />}>
                        <DigitalCard />
                      </ErrorBoundary>
                    )}
                  />

                  <Route
                    path="admin"
                    element={(
                      <ProtectedRoute roles={['admin']}>
                        <ErrorBoundary>
                          <AdminLayout />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    )}
                  >
                    <Route index element={<ErrorBoundary><AdminLeads /></ErrorBoundary>} />
                    <Route path="leads" element={<ErrorBoundary><AdminLeads /></ErrorBoundary>} />
                    <Route path="project-status" element={<ErrorBoundary><AdminProjectStatus /></ErrorBoundary>} />
                    <Route path=":resource" element={<ErrorBoundary><AdminResourceCrud /></ErrorBoundary>} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
