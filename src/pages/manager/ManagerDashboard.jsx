import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function ManagerDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalLeads: 0,
    assignedLeads: 0,
    convertedLeads: 0,
    teamLeads: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [teamLeads, setTeamLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const [statsRes, leadsRes, teamRes] = await Promise.all([
          API.get('/manager/stats'),
          API.get('/manager/recent-leads'),
          API.get('/manager/team'),
        ])
        setStats(statsRes.data)
        setRecentLeads(leadsRes.data)
        setTeamLeads(teamRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const statCards = [
    { label: 'Total leads', value: stats.totalLeads, icon: '📋', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { label: 'Assigned', value: stats.assignedLeads, icon: '📤', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { label: 'Converted', value: stats.convertedLeads, icon: '✅', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { label: 'Team leads', value: stats.teamLeads, icon: '👥', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ]

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-700',
    ASSIGNED: 'bg-purple-100 text-purple-700',
    CALLED: 'bg-green-100 text-green-700',
    NO_ANSWER: 'bg-amber-100 text-amber-700',
    INTERESTED: 'bg-teal-100 text-teal-700',
    NOT_INTERESTED: 'bg-red-100 text-red-700',
    CONVERTED: 'bg-green-100 text-green-700',
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Here is your team overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border ${card.border} p-4`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} mb-3`}>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? '...' : card.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent leads</h2>
            <button
              onClick={() => window.location.href = '/manager/leads'}
              className="text-xs text-purple-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No leads yet</div>
          ) : (
            <div>
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-400">{lead.phone}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[lead.status]}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Team lead performance</h2>
            <button
              onClick={() => window.location.href = '/manager/team'}
              className="text-xs text-purple-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : teamLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No team leads yet</div>
          ) : (
            <div>
              {teamLeads.map((tl) => (
                <div key={tl.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
                    {tl.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{tl.name}</div>
                    <div className="text-xs text-gray-400">
                      {tl._count?.assignedLeads || 0} leads assigned
                    </div>
                  </div>
                  <div className="text-xs font-medium text-purple-600">
                    {tl._count?.assignedLeads || 0} leads
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <button
          onClick={() => window.location.href = '/manager/leads'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-medium text-gray-900 text-sm">My leads</div>
          <div className="text-xs text-gray-500 mt-1">View and assign leads</div>
        </button>
        <button
          onClick={() => window.location.href = '/manager/team'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="font-medium text-gray-900 text-sm">My team</div>
          <div className="text-xs text-gray-500 mt-1">Manage team leads and agents</div>
        </button>
        <button
          onClick={() => window.location.href = '/manager/performance'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📈</div>
          <div className="font-medium text-gray-900 text-sm">Performance</div>
          <div className="text-xs text-gray-500 mt-1">View team performance</div>
        </button>
      </div>
    </DashboardLayout>
  )
}