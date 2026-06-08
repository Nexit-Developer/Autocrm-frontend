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

export default function AgentCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/customers')
        setCustomers(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My customers</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} customers assigned to you</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-medium">No customers yet</div>
            <div className="text-sm mt-1">Customers will appear here once assigned to you</div>
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
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Amount</th>
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
                    {customer.carModel || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.amount ? `$${customer.amount}` : '—'}
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