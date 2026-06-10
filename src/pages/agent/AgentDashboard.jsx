import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'
import AttendanceWidget from '../../components/AttendanceWidget'

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalLeads: 0,
    calledLeads: 0,
    interestedLeads: 0,
    convertedLeads: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityModal, setActivityModal] = useState(null)
  const [activityForm, setActivityForm] = useState({ type: 'CALL', notes: '', status: '' })
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          API.get('/agent/stats'),
          API.get('/agent/leads'),
        ])
        setStats(statsRes.data)
        setRecentLeads(leadsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshLeads = async () => {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        API.get('/agent/stats'),
        API.get('/agent/leads'),
      ])
      setStats(statsRes.data)
      setRecentLeads(leadsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogActivity = async () => {
    setActionLoading(activityModal.id)
    try {
      await API.post(`/agent/leads/${activityModal.id}/activity`, activityForm)
      setActivityModal(null)
      setActivityForm({ type: 'CALL', notes: '', status: '' })
      await refreshLeads()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log activity')
    } finally {
      setActionLoading(null)
    }
  }

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
    { label: 'My leads', value: stats.totalLeads, icon: '📋', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Called', value: stats.calledLeads, icon: '📞', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Interested', value: stats.interestedLeads, icon: '⭐', bg: 'bg-teal-50', border: 'border-teal-200' },
    { label: 'Converted', value: stats.convertedLeads, icon: '✅', bg: 'bg-purple-50', border: 'border-purple-200' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Here are your assigned leads.
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">My leads</h2>
          <button
            onClick={() => window.location.href = '/agent/leads'}
            className="text-xs text-purple-600 hover:underline"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : recentLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium">No leads assigned yet</div>
            <div className="text-sm mt-1">Your team lead will assign leads to you</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Last activity</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.slice(0, 10).map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-400">{lead.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[lead.status]}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {lead.activities?.[0]
                      ? new Date(lead.activities[0].createdAt).toLocaleDateString()
                      : 'No activity yet'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setActivityModal(lead)
                        setActivityForm({ type: 'CALL', notes: '', status: lead.status })
                      }}
                      className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Log activity
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Log activity</h3>
            <p className="text-sm text-gray-500 mb-4">
              Logging activity for <span className="font-medium text-gray-700">{activityModal.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity type
                </label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CALL">📞 Call</option>
                  <option value="MESSAGE">💬 Message</option>
                  <option value="EMAIL">📧 Email</option>
                  <option value="NOTE">📝 Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update lead status
                </label>
                <select
                  value={activityForm.status}
                  onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="CALLED">Called</option>
                  <option value="NO_ANSWER">No answer</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not interested</option>
                  <option value="CONVERTED">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Add any notes about this interaction..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActivityModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogActivity}
                disabled={actionLoading === activityModal.id}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === activityModal.id ? 'Saving...' : 'Save activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}