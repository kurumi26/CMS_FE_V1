import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import SitesPage from './pages/SitesPage'
import BuilderPage from './pages/BuilderPage'
import TemplatesPage from './pages/TemplatesPage'
import TeamPage from './pages/TeamPage'
import MediaPage from './pages/MediaPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import CMSPage from './pages/CMSPage'
import PreviewPage from './pages/PreviewPage'
import PublicSitePage from './pages/PublicSitePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e1e28', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />
        {/* Authenticated dashboard routes */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="analytics/:siteId" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="cms/:siteId" element={<CMSPage />} />
        </Route>
        <Route
          path="/builder/:siteId/:pageId"
          element={
            <PrivateRoute>
              <BuilderPage />
            </PrivateRoute>
          }
        />
        <Route path="/preview/:siteId/:pageId" element={<PrivateRoute><PreviewPage /></PrivateRoute>} />
        {/* Public site routes — no auth required */}
        <Route path="/s/:slug" element={<PublicSitePage />} />
        <Route path="/s/:slug/:pageSlug" element={<PublicSitePage />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
