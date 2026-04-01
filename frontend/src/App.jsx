import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import DashboardPage    from './pages/DashboardPage'
import ScreenPage       from './pages/ScreenPage'
import SessionPage      from './pages/SessionPage'
import AdminPage        from './pages/AdminPage'
import DocumentationPage from './pages/DocumentationPage'
import ApiReferencePage from './pages/ApiReferencePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfUsePage   from './pages/TermsOfUsePage'
import ContactPage      from './pages/ContactPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-3)', gap:10 }}>
      <div style={{ width:22, height:22, border:'3px solid var(--border)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      Loading…
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<DashboardPage />} />
            <Route path="screen"      element={<ScreenPage />} />
            <Route path="sessions/:id" element={<SessionPage />} />
            <Route path="admin"       element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="docs"        element={<DocumentationPage />} />
            <Route path="api"         element={<ApiReferencePage />} />
            <Route path="privacy"     element={<PrivacyPolicyPage />} />
            <Route path="terms"       element={<TermsOfUsePage />} />
            <Route path="contact"     element={<ContactPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
