import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function MyLeave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'CASUAL',
    reason: '',
    startDate: '',
    endDate: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/hr/leaves/my')
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
      const res = await API.get('/hr/leaves/my')
      setLeaves(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    if (!form.reason.trim()) return alert('Please enter a reason')
    if (!form.startDate) return alert('Please select start date')
    if (!form.endDate) return alert('Please select end date')
    if (new Date(form.startDate) > new Date(form.endDate)) {
      return alert('End date must be after start date')
    }
    setSubmitting(true)
    try {
      await API.post('/hr/leaves/apply', form)
      setShowForm(false)
      setForm({ type: 'CASUAL', reason: '', startDate: '', endDate: '' })
      await refreshLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave')
    } finally {
      setSubmitting(false)
    }
  }

  const getDays = (start, end) => {
    const diff = new Date(end) - new Date(start)
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My leave</h1>
          <p className="text-gray-500 text-sm mt-1">Apply and track your leave requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Apply for leave
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <div className="font-medium">No leave requests yet</div>
            <div className="text-sm mt-1">Click the button above to apply for leave</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">From</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">To</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Days</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Reason</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{leave.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getDays(leave.startDate, leave.endDate)} days
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-32 truncate">
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(leave.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Apply for leave</h3>
            <p className="text-sm text-gray-500 mb-4">Fill in the details below</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CASUAL">Casual</option>
                  <option value="SICK">Sick</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Reason for leave..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}