import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

const statusColors = {
  NEW: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  CALLED: 'bg-green-100 text-green-700',
  NO_ANSWER: 'bg-amber-100 text-amber-700',
  INTERESTED: 'bg-teal-100 text-teal-700',
  NOT_INTERESTED: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-green-100 text-green-700',
}

export default function AgentLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [activityModal, setActivityModal] = useState(null)
  const [activitiesModal, setActivitiesModal] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityForm, setActivityForm] = useState({ type: 'CALL', notes: '', status: '' })
  const [actionLoading, setActionLoading] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const leadsPerPage = 15

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/agent/leads')
        setLeads(res.data)
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
      const res = await API.get('/agent/leads')
      setLeads(res.data)
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

  const handleViewActivities = async (lead) => {
    setActivitiesModal(lead)
    try {
      const res = await API.get(`/agent/leads/${lead.id}/activities`)
      setActivities(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchStatus = filterStatus ? l.status === filterStatus : true
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / leadsPerPage)
  const paginated = filtered.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  )

  const activityIcons = {
    CALL: '📞',
    MESSAGE: '💬',
    EMAIL: '📧',
    NOTE: '📝',
    STATUS_CHANGE: '🔄',
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My leads</h1>
        <p className="text-gray-500 text-sm mt-1">{leads.length} leads assigned to you</p>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All statuses</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium">No leads found</div>
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
              {paginated.map((lead) => (
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
                      ? `${activityIcons[lead.activities[0].type]} ${new Date(lead.activities[0].createdAt).toLocaleDateString()}`
                      : 'No activity yet'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActivityModal(lead)
                          setActivityForm({ type: 'CALL', notes: '', status: lead.status })
                        }}
                        className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        Log
                      </button>
                      <button
                        onClick={() => handleViewActivities(lead)}
                        className="bg-gray-50 text-gray-600 border border-gray-200 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * leadsPerPage + 1} to {Math.min(currentPage * leadsPerPage, filtered.length)} of {filtered.length} leads
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Log activity</h3>
            <p className="text-sm text-gray-500 mb-4">
              For <span className="font-medium text-gray-700">{activityModal.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Update status</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Add notes about this interaction..."
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
                {actionLoading === activityModal.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Activity history</h3>
            <p className="text-sm text-gray-500 mb-4">
              {activitiesModal.name}
            </p>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No activities yet</div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{activityIcons[activity.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">{activity.type}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {activity.notes && (
                        <p className="text-xs text-gray-600 mt-1">{activity.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setActivitiesModal(null)}
              className="w-full mt-4 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}