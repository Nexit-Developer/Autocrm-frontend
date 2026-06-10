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

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [managers, setManagers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterAssigned, setFilterAssigned] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [bulkAssignModal, setBulkAssignModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedManager, setSelectedManager] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const leadsPerPage = 15

  useEffect(() => {
    const getData = async () => {
      try {
        const [leadsRes, managersRes, companiesRes] = await Promise.all([
          API.get('/leads'),
          API.get('/admin/managers'),
          API.get('/admin/companies'),
        ])
        setLeads(leadsRes.data)
        setManagers(managersRes.data)
        setCompanies(companiesRes.data)
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
      const res = await API.get('/leads')
      setLeads(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssign = async () => {
    if (!selectedManager) return alert('Please select a manager')
    setActionLoading(true)
    try {
      await API.put(`/leads/${assignModal.id}/assign`, {
        assignedToId: parseInt(selectedManager)
      })
      setAssignModal(null)
      setSelectedManager('')
      await refreshLeads()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign lead')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkAssign = async () => {
    if (!selectedManager) return alert('Please select a manager')
    if (selectedLeads.length === 0) return alert('Please select at least one lead')
    setActionLoading(true)
    try {
      await API.post('/leads/bulk-assign', {
        leadIds: selectedLeads,
        assignedToId: parseInt(selectedManager)
      })
      setBulkAssignModal(false)
      setSelectedLeads([])
      setSelectedManager('')
      await refreshLeads()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to bulk assign')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      await API.post('/leads/bulk-delete', { leadIds: selectedLeads })
      setSelectedLeads([])
      await refreshLeads()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete leads')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSingle = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return
    try {
      await API.delete(`/leads/${lead.id}`)
      await refreshLeads()
    } catch {
      alert('Failed to delete lead')
    }
  }

  const toggleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === paginated.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(paginated.map((l) => l.id))
    }
  }

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchStatus = filterStatus ? l.status === filterStatus : true
    const matchCompany = filterCompany ? l.companyId === parseInt(filterCompany) : true
    const matchAssigned = filterAssigned === 'unassigned'
      ? !l.assignedToId
      : filterAssigned === 'assigned'
      ? !!l.assignedToId
      : true
    return matchSearch && matchStatus && matchCompany && matchAssigned
  })

  const totalPages = Math.ceil(filtered.length / leadsPerPage)
  const paginated = filtered.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  )

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {leads.length} total — {leads.filter(l => !l.assignedToId).length} unassigned
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {selectedLeads.length > 0 && (
            <>
              <button
                onClick={() => setBulkAssignModal(true)}
                disabled={actionLoading}
                className="bg-amber-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
              >
                Assign {selectedLeads.length} selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="bg-red-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                Delete {selectedLeads.length} selected
              </button>
            </>
          )}
          <button
            onClick={() => window.location.href = '/dashboard/leads/import'}
            className="bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            + Import leads
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={filterAssigned}
          onChange={(e) => { setFilterAssigned(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All leads</option>
          <option value="unassigned">Unassigned only</option>
          <option value="assigned">Assigned only</option>
        </select>
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
        <select
          value={filterCompany}
          onChange={(e) => { setFilterCompany(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium">No leads found</div>
            <div className="text-sm mt-1">Import leads from Meta to get started</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Assigned to</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((lead) => (
                <tr
                  key={lead.id}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    selectedLeads.includes(lead.id) ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="rounded"
                    />
                  </td>
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lead.company?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                          {lead.assignedTo.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{lead.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAssignModal(lead)
                          setSelectedManager(lead.assignedToId || '')
                        }}
                        className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        {lead.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(lead)}
                        className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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

      {/* Single Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Assign lead</h3>
            <p className="text-sm text-gray-500 mb-4">
              Assigning <span className="font-medium text-gray-700">{assignModal.name}</span> to a manager
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select manager</label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select manager...</option>
                {managers
                  .filter((m) => !assignModal.companyId || m.companyId === assignModal.companyId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.company?.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAssignModal(null); setSelectedManager('') }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {bulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Bulk assign leads</h3>
            <p className="text-sm text-gray-500 mb-4">
              Assigning <span className="font-medium text-gray-700">{selectedLeads.length} leads</span> to a manager
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select manager</label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select manager...</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.company?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setBulkAssignModal(false); setSelectedManager('') }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : `Assign ${selectedLeads.length} leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}