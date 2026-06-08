import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

const paymentColors = {
  UNPAID: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  COMPLETE: 'bg-teal-100 text-teal-700',
}

const deliveryColors = {
  RESERVED: 'bg-amber-100 text-amber-700',
  IN_PROCESS: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  ARRIVED: 'bg-green-100 text-green-700',
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [companies, setCompanies] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({
    paymentStatus: '',
    deliveryStatus: '',
    carModel: '',
    carColor: '',
    amount: '',
    assignedAgentId: ''
  })
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const [customersRes, companiesRes, agentsRes] = await Promise.all([
          API.get('/customers'),
          API.get('/admin/companies'),
          API.get('/admin/agents'),
        ])
        setCustomers(customersRes.data)
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

  const refreshCustomers = async () => {
    try {
      const res = await API.get('/customers')
      setCustomers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (customer) => {
    setEditModal(customer)
    setEditForm({
      paymentStatus: customer.paymentStatus || 'UNPAID',
      deliveryStatus: customer.deliveryStatus || '',
      carModel: customer.carModel || '',
      carColor: customer.carColor || '',
      amount: customer.amount || '',
      assignedAgentId: customer.assignedAgentId || ''
    })
  }

  const handleSaveEdit = async () => {
    setActionLoading(editModal.id)
    try {
      await API.put(`/customers/${editModal.id}`, editForm)
      setEditModal(null)
      await refreshCustomers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update customer')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    const matchPayment = filterPayment ? c.paymentStatus === filterPayment : true
    const matchCompany = filterCompany ? c.companyId === parseInt(filterCompany) : true
    return matchSearch && matchPayment && matchCompany
  })

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} total customers</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All payment status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="COMPLETE">Complete</option>
        </select>
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-medium">No customers found</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Delivery</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Car</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Agent</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-400">{customer.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${paymentColors[customer.paymentStatus]}`}>
                      {customer.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {customer.deliveryStatus ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${deliveryColors[customer.deliveryStatus]}`}>
                        {customer.deliveryStatus.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.carModel ? `${customer.carModel} ${customer.carColor ? `(${customer.carColor})` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.assignedAgent?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.amount ? `$${customer.amount}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit customer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Editing <span className="font-medium text-gray-700">{editModal.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment status
                </label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="COMPLETE">Complete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery status
                </label>
                <select
                  value={editForm.deliveryStatus}
                  onChange={(e) => setEditForm({ ...editForm, deliveryStatus: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Not set</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="IN_PROCESS">In Process</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="ARRIVED">Arrived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car model
                </label>
                <input
                  type="text"
                  value={editForm.carModel}
                  onChange={(e) => setEditForm({ ...editForm, carModel: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Toyota Corolla"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car color
                </label>
                <input
                  type="text"
                  value={editForm.carColor}
                  onChange={(e) => setEditForm({ ...editForm, carColor: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. White"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned agent
                </label>
                <select
                  value={editForm.assignedAgentId}
                  onChange={(e) => setEditForm({ ...editForm, assignedAgentId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select agent...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.company?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading === editModal.id}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === editModal.id ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}