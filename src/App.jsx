import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import PendingUsers from './pages/dashboard/PendingUsers'
import AllUsers from './pages/dashboard/AllUsers'
import Companies from './pages/dashboard/Companies'
import LeadImport from './pages/dashboard/LeadImport'
import Leads from './pages/dashboard/Leads'
import Customers from './pages/dashboard/Customers'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerLeads from './pages/manager/ManagerLeads'
import ManagerTeam from './pages/manager/ManagerTeam'
import TeamLeadDashboard from './pages/teamlead/TeamLeadDashboard'
import AgentDashboard from './pages/agent/AgentDashboard'
import TeamLeadLeads from './pages/teamlead/TeamLeadLeads'
import TeamLeadAgents from './pages/teamlead/TeamLeadAgents'
import AgentLeads from './pages/agent/AgentLeads'
import AgentCustomers from './pages/agent/AgentCustomers'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/dashboard/users"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <AllUsers />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/companies"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <Companies />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/leads/import"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <LeadImport />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/leads"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <Leads />
    </ProtectedRoute>
  }
/>
<Route path="/teamlead/leads" element={
  <ProtectedRoute roles={['TEAM_LEAD']}>
    <TeamLeadLeads />
  </ProtectedRoute>
} />

<Route path="/teamlead/agents" element={
  <ProtectedRoute roles={['TEAM_LEAD']}>
    <TeamLeadAgents />
  </ProtectedRoute>
} />

<Route path="/agent/leads" element={
  <ProtectedRoute roles={['AGENT']}>
    <AgentLeads />
  </ProtectedRoute>
} />

<Route path="/agent/customers" element={
  <ProtectedRoute roles={['AGENT']}>
    <AgentCustomers />
  </ProtectedRoute>
} />
<Route
  path="/dashboard/customers"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <Customers />
    </ProtectedRoute>
  }
/>
    <Route
  path="/manager"
  element={
    <ProtectedRoute roles={['MANAGER']}>
      <ManagerDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/manager/leads"
  element={
    <ProtectedRoute roles={['MANAGER']}>
      <ManagerLeads />
    </ProtectedRoute>
  }
/>
<Route
  path="/manager/team"
  element={
    <ProtectedRoute roles={['MANAGER']}>
      <ManagerTeam />
    </ProtectedRoute>
  }
/>
      <Route
  path="/teamlead"
  element={
    <ProtectedRoute roles={['TEAM_LEAD']}>
      <TeamLeadDashboard />
    </ProtectedRoute>
  }
/>

        <Route
  path="/agent"
  element={
    <ProtectedRoute roles={['AGENT']}>
      <AgentDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/hr"
          element={
            <ProtectedRoute roles={['HR']}>
              <div className="p-8 text-2xl font-semibold">HR Dashboard — Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
  path="/dashboard/pending-users"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <PendingUsers />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  )
}

export default App