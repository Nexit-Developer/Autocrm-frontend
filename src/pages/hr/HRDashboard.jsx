import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'
import AttendanceWidget from '../../components/AttendanceWidget'

export default function HRDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    unpaidPayrolls: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/hr/stats')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const statCards = [
    { label: 'Total employees', value: stats.totalEmployees, icon: '👥', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Present today', value: stats.presentToday, icon: '✅', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Pending leaves', value: stats.pendingLeaves, icon: '📅', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Unpaid payrolls', value: stats.unpaidPayrolls, icon: '💰', bg: 'bg-red-50', border: 'border-red-200' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Here is your HR overview.
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
        <button
          onClick={() => window.location.href = '/hr/attendance'}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">🕐</div>
          <div className="font-medium text-gray-900">Attendance</div>
          <div className="text-sm text-gray-500 mt-1">Track daily attendance</div>
        </button>
        <button
          onClick={() => window.location.href = '/hr/leave'}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-medium text-gray-900">Leave requests</div>
          <div className="text-sm text-gray-500 mt-1">Approve or reject leave</div>
        </button>
        <button
          onClick={() => window.location.href = '/hr/payroll'}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-medium text-gray-900">Payroll</div>
          <div className="text-sm text-gray-500 mt-1">Manage monthly payroll</div>
        </button>
        <button
          onClick={() => window.location.href = '/hr/performance'}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors text-left"
        >
          <div className="text-2xl mb-2">📈</div>
          <div className="font-medium text-gray-900">Performance</div>
          <div className="text-sm text-gray-500 mt-1">Review employee performance</div>
        </button>
      </div>
    </DashboardLayout>
  )
}