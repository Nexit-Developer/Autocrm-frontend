import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function PendingUsers() {
  const [pendingAgents, setPendingAgents] = useState([])
  const [pendingCustomers, setPendingCustomers] = useState([])
  const [companies, setCompanies] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('agents')
  const [actionLoading, setActionLoading] = useState(null)
  const [agentModal, setAgentModal] = useState(null)
  const [customerModal, setCustomerModal] = useState(null)
  const [agentForm, setAgentForm] = useState({ companyId: '', role: 'AGENT' })
  const [customerForm, setCustomerForm] = useState({ companyId: '', assignedAgentId: '' })

  useEffect(() => {
    const getData = async () => {
      try {
        const [pendingRes, companiesRes, agentsRes] = await Promise.all([
          API.get('/admin/pending-users'),
          API.get('/admin/companies'),
          API.get('/admin/agents'),
        ])
        setPendingAgents(pendingRes.data.agents)
        setPendingCustomers(pendingRes.data.customers)
        setCompanies(companiesRes.data)
        setAgents(agentsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshData = async () => {
    try {
      const [pendingRes, companiesRes, agentsRes] = await Promise.all([
        API.get('/admin/pending-users'),
        API.get('/admin/companies'),
        API.get('/admin/agents'),
      ])
      setPendingAgents(pendingRes.data.agents)
      setPendingCustomers(pendingRes.data.customers)
      setCompanies(companiesRes.data)
      setAgents(agentsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveAgent = async () => {
    if (!agentForm.companyId) return alert('Please select a company')
    setActionLoading(agentModal.id)
    try {
      await API.post(`/admin/approve-agent/${agentModal.id}`, agentForm)
      setAgentModal(null)
      setAgentForm({ companyId: '', role: 'AGENT' })
      await refreshData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveCustomer = async () => {
    if (!customerForm.companyId) return alert('Please select a company')
    if (!customerForm.assignedAgentId) return alert('Please assign an agent')
    setActionLoading(customerModal.id)
    try {
      await API.post(`/admin/approve-customer/${customerModal.id}`, customerForm)
      setCustomerModal(null)
      setCustomerForm({ companyId: '', assignedAgentId: '' })
      await refreshData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id, type) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return
    setActionLoading(id)
    try {
      await API.post(`/admin/reject/${type}/${id}`)
      await refreshData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const roleOptions = ['AGENT', 'TEAM_LEAD', 'MANAGER', 'HR']

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Pending users</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve new signup requests</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'agents'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Agents ({pendingAgents.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'customers'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Customers ({pendingCustomers.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {activeTab === 'agents' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {pendingAgents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-medium">No pending agents</div>
                  <div className="text-sm mt-1">All agent requests have been reviewed</div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Signed up</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAgents.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setAgentModal(user)
                                setAgentForm({ companyId: '', role: 'AGENT' })
                              }}
                              className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.id, 'agent')}
                              disabled={actionLoading === user.id}
                              className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {pendingCustomers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-medium">No pending customers</div>
                  <div className="text-sm mt-1">All customer requests have been reviewed</div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Signed up</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                              {customer.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCustomerModal(customer)
                                setCustomerForm({ companyId: '', assignedAgentId: '' })
                              }}
                              className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(customer.id, 'customer')}
                              disabled={actionLoading === customer.id}
                              className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {agentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Approve agent</h3>
            <p className="text-sm text-gray-500 mb-4">
              Approving <span className="font-medium text-gray-700">{agentModal.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to company
                </label>
                <select
                  value={agentForm.companyId}
                  onChange={(e) => setAgentForm({ ...agentForm, companyId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign role
                </label>
                <select
                  value={agentForm.role}
                  onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAgentModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAgent}
                disabled={actionLoading === agentModal.id}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === agentModal.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {customerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Approve customer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Approving <span className="font-medium text-gray-700">{customerModal.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to company
                </label>
                <select
                  value={customerForm.companyId}
                  onChange={(e) => setCustomerForm({ ...customerForm, companyId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign agent to handle this customer
                </label>
                <select
                  value={customerForm.assignedAgentId}
                  onChange={(e) => setCustomerForm({ ...customerForm, assignedAgentId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select agent...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {a.company?.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCustomerModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveCustomer}
                disabled={actionLoading === customerModal.id}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === customerModal.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}