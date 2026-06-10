import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function ManagerPerformance() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/manager/performance')
        setEmployees(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const getPerformanceColor = (rate) => {
    if (rate >= 70) return 'bg-green-500'
    if (rate >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getPerformanceBadge = (rate) => {
    if (rate >= 70) return 'bg-green-100 text-green-700'
    if (rate >= 40) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Team performance</h1>
        <p className="text-gray-500 text-sm mt-1">Performance overview of your team</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📈</div>
            <div className="font-medium">No performance data yet</div>
            <div className="text-sm mt-1">Data will appear once leads are assigned</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Employee</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Leads</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Contacted</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Converted</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Response rate</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const responseRate = emp.totalLeads > 0
                  ? Math.round((emp.contactedLeads / emp.totalLeads) * 100)
                  : 0
                return (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.totalLeads}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.contactedLeads}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.convertedLeads}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-20">
                          <div
                            className={`h-2 rounded-full ${getPerformanceColor(responseRate)}`}
                            style={{ width: `${responseRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{responseRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPerformanceBadge(responseRate)}`}>
                        {responseRate >= 70 ? 'Good' : responseRate >= 40 ? 'Average' : 'Low'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}