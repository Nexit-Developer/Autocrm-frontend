import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminDashboard from './pages/dashboard/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/manager" element={
          <ProtectedRoute roles={['MANAGER']}>
            <div className="p-8 text-2xl font-semibold">Manager Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="/teamlead" element={
          <ProtectedRoute roles={['TEAM_LEAD']}>
            <div className="p-8 text-2xl font-semibold">Team Lead Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="/agent" element={
          <ProtectedRoute roles={['AGENT']}>
            <div className="p-8 text-2xl font-semibold">Agent Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="/hr" element={
          <ProtectedRoute roles={['HR']}>
            <div className="p-8 text-2xl font-semibold">HR Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App