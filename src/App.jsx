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
import HRDashboard from './pages/hr/HRDashboard'
import Attendance from './pages/hr/Attendance'
import Leave from './pages/hr/Leave'
import Payroll from './pages/hr/Payroll'
import Performance from './pages/hr/Performance'
import MonthlyAttendance from './pages/hr/MonthlyAttendance'
import MyLeave from './pages/common/MyLeave'
import AdminAttendance from './pages/dashboard/AdminAttendance'
import AdminPayroll from './pages/dashboard/AdminPayroll'
import AdminPerformance from './pages/dashboard/AdminPerformance'
import ManagerPerformance from './pages/manager/ManagerPerformance'
import Profile from './pages/common/Profile'
import Announcements from './pages/common/Announcements'
import Policy from './pages/common/Policy'
import Chat from './pages/common/Chat'
import Tasks from './pages/common/Tasks'


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
        <Route path="/announcements" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT']}>
    <Announcements />
  </ProtectedRoute>
} />
<Route path="/chat" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT']}>
    <Chat />
  </ProtectedRoute>
} />

<Route path="/policy" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT']}>
    <Policy />
  </ProtectedRoute>
} />
        <Route
  path="/dashboard/users"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <AllUsers />
    </ProtectedRoute>
  }
/>
<Route path="/tasks" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT']}>
    <Tasks />
  </ProtectedRoute>
} />
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
<Route path="/profile" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEAD', 'AGENT', 'HR']}>
    <Profile />
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
<Route path="/manager/performance" element={
  <ProtectedRoute roles={['MANAGER']}>
    <ManagerPerformance />
  </ProtectedRoute>
} />
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
<Route path="/hr" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN']}>
    <HRDashboard />
  </ProtectedRoute>
} />
<Route path="/hr/attendance" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN']}>
    <Attendance />
  </ProtectedRoute>
} />
<Route path="/hr/leave" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN']}>
    <Leave />
  </ProtectedRoute>
} />
<Route path="/hr/payroll" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN']}>
    <Payroll />
  </ProtectedRoute>
} />
<Route path="/hr/performance" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN']}>
    <Performance />
  </ProtectedRoute>
} />
<Route path="/hr/attendance/monthly" element={
  <ProtectedRoute roles={['HR', 'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEAD']}>
    <MonthlyAttendance />
  </ProtectedRoute>
} />
        <Route
  path="/dashboard/pending-users"
  element={
    <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
      <PendingUsers />
    </ProtectedRoute>
  }
/>
<Route path="/my-leave" element={
  <ProtectedRoute roles={['ADMIN', 'MANAGER', 'TEAM_LEAD', 'AGENT', 'HR']}>
    <MyLeave />
  </ProtectedRoute>
} />

<Route path="/dashboard/attendance" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
    <AdminAttendance />
  </ProtectedRoute>
} />
<Route path="/dashboard/payroll" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
    <AdminPayroll />
  </ProtectedRoute>
} />

<Route path="/dashboard/performance" element={
  <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
    <AdminPerformance />
  </ProtectedRoute>
} />

      </Routes>
    </BrowserRouter>
  )
}

export default App