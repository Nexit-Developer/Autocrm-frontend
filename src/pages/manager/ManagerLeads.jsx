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

export default function ManagerLeads() {
  const [leads, setLeads] = useState([])
  const [teamLeads, setTeamLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedTeamLead, setSelectedTeamLead] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const leadsPerPage = 15

  useEffect(() => {
    const getData = async () => {
      try {
        const [leadsRes, teamLeadsRes] = await Promise.all([
          API.get('/manager/leads'),
          API.get('/manager/team-leads'),
        ])
        setLeads(leadsRes.data)
        setTeamLeads(teamLeadsRes.data)
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
      const res = await API.get('/manager/leads')
      setLeads(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssign = async () => {
    if (!selectedTeamLead) return alert('Please select a team lead')
    setActionLoading(assignModal.id)
    try {
      await API.put(`/manager/leads/${assignModal.id}/assign`, {
        assignedToId: parseInt(selectedTeamLead)
      })
      setAssignModal(null)
      setSelectedTeamLead('')
      await refreshLeads()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign lead')
    } finally {
      setActionLoading(null)
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My leads</h1>
        <p className="text-gray-500 text-sm mt-1">{leads.length} total leads in your company</p>
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
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Assigned to</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
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
                  <td className="px-4 py-3">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
                          {lead.assignedTo.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{lead.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setAssignModal(lead)
                        setSelectedTeamLead(lead.assignedToId || '')
                      }}
                      className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      {lead.assignedTo ? 'Reassign' : 'Assign'}
                    </button>
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

      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Assign lead</h3>
            <p className="text-sm text-gray-500 mb-4">
              Assigning <span className="font-medium text-gray-700">{assignModal.name}</span> to a team lead
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select team lead
              </label>
              <select
                value={selectedTeamLead}
                onChange={(e) => setSelectedTeamLead(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select team lead...</option>
                {teamLeads.map((tl) => (
                  <option key={tl.id} value={tl.id}>{tl.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAssignModal(null); setSelectedTeamLead('') }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={actionLoading === assignModal.id}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === assignModal.id ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}