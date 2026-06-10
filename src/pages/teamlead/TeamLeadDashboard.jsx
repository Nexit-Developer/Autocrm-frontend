import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'
import AttendanceWidget from '../../components/AttendanceWidget'
export default function TeamLeadDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalLeads: 0,
    assignedLeads: 0,
    convertedLeads: 0,
    totalAgents: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const [statsRes, leadsRes, agentsRes] = await Promise.all([
          API.get('/teamlead/stats'),
          API.get('/teamlead/recent-leads'),
          API.get('/teamlead/agents'),
        ])
        setStats(statsRes.data)
        setRecentLeads(leadsRes.data)
        setAgents(agentsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-700',
    ASSIGNED: 'bg-purple-100 text-purple-700',
    CALLED: 'bg-green-100 text-green-700',
    NO_ANSWER: 'bg-amber-100 text-amber-700',
    INTERESTED: 'bg-teal-100 text-teal-700',
    NOT_INTERESTED: 'bg-red-100 text-red-700',
    CONVERTED: 'bg-green-100 text-green-700',
  }

  const statCards = [
    { label: 'Total leads', value: stats.totalLeads, icon: '📋', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Assigned', value: stats.assignedLeads, icon: '📤', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Converted', value: stats.convertedLeads, icon: '✅', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'My agents', value: stats.totalAgents, icon: '👤', bg: 'bg-amber-50', border: 'border-amber-200' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Team Lead Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Here is your team overview.
        </p>
        <AttendanceWidget />
      </div>

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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent leads</h2>
            <button
              onClick={() => window.location.href = '/teamlead/leads'}
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

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">My agents</h2>
            <button
              onClick={() => window.location.href = '/teamlead/agents'}
              className="text-xs text-purple-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No agents assigned yet</div>
          ) : (
            <div>
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-400">
                      {agent._count?.assignedLeads || 0} leads assigned
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <button
          onClick={() => window.location.href = '/teamlead/leads'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-medium text-gray-900 text-sm">My leads</div>
          <div className="text-xs text-gray-500 mt-1">View and assign leads to agents</div>
        </button>
        <button
          onClick={() => window.location.href = '/teamlead/agents'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">👤</div>
          <div className="font-medium text-gray-900 text-sm">My agents</div>
          <div className="text-xs text-gray-500 mt-1">View agent activity</div>
        </button>
        <button
          onClick={() => window.location.href = '/teamlead/assign'}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📤</div>
          <div className="font-medium text-gray-900 text-sm">Assign leads</div>
          <div className="text-xs text-gray-500 mt-1">Assign leads to agents</div>
        </button>
      </div>
    </DashboardLayout>
  )
}