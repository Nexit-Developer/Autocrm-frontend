import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const navItems = {
  SUPER_ADMIN: [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Companies', icon: '🏢', path: '/dashboard/companies' },
    { label: 'Pending Users', icon: '⏳', path: '/dashboard/pending-users' },
    { label: 'All Users', icon: '👥', path: '/dashboard/users' },
    { label: 'Leads', icon: '📋', path: '/dashboard/leads' },
    { label: 'Customers', icon: '🚗', path: '/dashboard/customers' },
    { label: 'Attendance', icon: '🕐', path: '/dashboard/attendance' },
    { label: 'Leave', icon: '📅', path: '/dashboard/leave' },
    { label: 'Payroll', icon: '💰', path: '/dashboard/payroll' },
    { label: 'Performance', icon: '📈', path: '/dashboard/performance' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Pending Users', icon: '⏳', path: '/dashboard/pending-users' },
    { label: 'All Users', icon: '👥', path: '/dashboard/users' },
    { label: 'Leads', icon: '📋', path: '/dashboard/leads' },
    { label: 'Customers', icon: '🚗', path: '/dashboard/customers' },
    { label: 'Attendance', icon: '🕐', path: '/dashboard/attendance' },
    { label: 'Leave', icon: '📅', path: '/dashboard/leave' },
    { label: 'Payroll', icon: '💰', path: '/dashboard/payroll' },
    { label: 'Performance', icon: '📈', path: '/dashboard/performance' },
  ],
  MANAGER: [
    { label: 'Dashboard', icon: '📊', path: '/manager' },
    { label: 'My Leads', icon: '📋', path: '/manager/leads' },
    { label: 'My Team', icon: '👥', path: '/manager/team' },
    { label: 'Assign Leads', icon: '📤', path: '/manager/assign' },
    { label: 'Performance', icon: '📈', path: '/manager/performance' },
  ],
  TEAM_LEAD: [
    { label: 'Dashboard', icon: '📊', path: '/teamlead' },
    { label: 'My Leads', icon: '📋', path: '/teamlead/leads' },
    { label: 'My Agents', icon: '👥', path: '/teamlead/agents' },
  ],
  AGENT: [
    { label: 'Dashboard', icon: '📊', path: '/agent' },
    { label: 'My Leads', icon: '📋', path: '/agent/leads' },
    { label: 'My Customers', icon: '🚗', path: '/agent/customers' },
  ],
  HR: [
    { label: 'Dashboard', icon: '📊', path: '/hr' },
    { label: 'Attendance', icon: '🕐', path: '/hr/attendance' },
    { label: 'Leave', icon: '📅', path: '/hr/leave' },
    { label: 'Payroll', icon: '💰', path: '/hr/payroll' },
    { label: 'Performance', icon: '📈', path: '/hr/performance' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const items = navItems[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🚗</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">AutoCRM</div>
            <div className="text-xs text-gray-400">
              {user?.company?.name || 'Nexit Solution'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}