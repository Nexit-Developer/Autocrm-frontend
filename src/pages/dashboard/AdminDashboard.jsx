import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingUsers: 0,
    totalAgents: 0,
    totalLeads: 0,
    totalCustomers: 0
  })
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  const getStats = async () => {
    try {
      const res = await API.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  getStats()
}, [])
  
  const statCards = [
    { label: 'Pending approvals', value: stats.pendingUsers, icon: '⏳', color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
    { label: 'Total agents', value: stats.totalAgents, icon: '👥', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
    { label: 'Total leads', value: stats.totalLeads, icon: '📋', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Total customers', value: stats.totalCustomers, icon: '🚗', color: 'bg-green-50 text-green-700', border: 'border-green-200' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border ${card.border} p-4`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.color} mb-3`}>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? '...' : card.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Pending users alert */}
      {stats.pendingUsers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-sm font-medium text-amber-800">
                {stats.pendingUsers} user{stats.pendingUsers > 1 ? 's' : ''} waiting for approval
              </div>
              <div className="text-xs text-amber-600">Review and approve pending accounts</div>
            </div>
          </div>
          
            <button
  onClick={() => window.location.href='/dashboard/pending-users'}
  className="bg-amber-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
>
  Review now
</button>
        </div>
      )}

     {/* Quick links */}
<div className="grid grid-cols-2 gap-4">
  <button onClick={() => window.location.href='/dashboard/pending-users'} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors group text-left w-full">
    <div className="text-2xl mb-2">⏳</div>
    <div className="font-medium text-gray-900 group-hover:text-purple-700">Pending users</div>
    <div className="text-sm text-gray-500 mt-1">Approve or reject new signups</div>
  </button>
  <button onClick={() => window.location.href='/dashboard/leads'} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors group text-left w-full">
    <div className="text-2xl mb-2">📋</div>
    <div className="font-medium text-gray-900 group-hover:text-purple-700">Manage leads</div>
    <div className="text-sm text-gray-500 mt-1">Import and assign leads</div>
  </button>
  <button onClick={() => window.location.href='/dashboard/users'} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors group text-left w-full">
    <div className="text-2xl mb-2">👥</div>
    <div className="font-medium text-gray-900 group-hover:text-purple-700">All users</div>
    <div className="text-sm text-gray-500 mt-1">Manage roles and companies</div>
  </button>
  <button onClick={() => window.location.href='/dashboard/customers'} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors group text-left w-full">
    <div className="text-2xl mb-2">🚗</div>
    <div className="font-medium text-gray-900 group-hover:text-purple-700">Customers</div>
    <div className="text-sm text-gray-500 mt-1">View and manage customers</div>
  </button>
</div>
    </DashboardLayout>
  )
}