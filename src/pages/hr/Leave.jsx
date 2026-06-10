import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/hr/leaves')
        setLeaves(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshLeaves = async () => {
    try {
      const res = await API.get('/hr/leaves')
      setLeaves(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAction = async (id, status) => {
    setActionLoading(id)
    try {
      await API.put(`/hr/leaves/${id}`, { status })
      await refreshLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = leaves.filter((l) =>
    filterStatus ? l.status === filterStatus : true
  )

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Leave requests</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or reject employee leave requests</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s} ({leaves.filter((l) => l.status === s).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <div className="font-medium">No leave requests</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Employee</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">From</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">To</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Reason</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                        {leave.user?.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{leave.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leave.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-32 truncate">
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {leave.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(leave.id, 'APPROVED')}
                          disabled={actionLoading === leave.id}
                          className="bg-green-50 text-green-600 border border-green-200 text-xs px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(leave.id, 'REJECTED')}
                          disabled={actionLoading === leave.id}
                          className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}