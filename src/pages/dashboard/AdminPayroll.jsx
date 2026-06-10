import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function AdminPayroll() {
  const [employees, setEmployees] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [filterCompany, setFilterCompany] = useState('')
  const [payrollModal, setPayrollModal] = useState(null)
  const [payrollForm, setPayrollForm] = useState({
    basicSalary: '',
    deductions: '0',
    bonus: '0',
  })
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const [empRes, payrollRes, companiesRes] = await Promise.all([
          API.get('/admin/all-employees'),
          API.get(`/admin/payroll?month=${selectedMonth}`),
          API.get('/admin/companies'),
        ])
        setEmployees(empRes.data)
        setPayrolls(payrollRes.data)
        setCompanies(companiesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [selectedMonth])

  const refreshPayrolls = async () => {
    try {
      const res = await API.get(`/admin/payroll?month=${selectedMonth}`)
      setPayrolls(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getPayrollForEmployee = (employeeId) => {
    return payrolls.find((p) => p.userId === employeeId)
  }

  const handleSavePayroll = async () => {
    if (!payrollForm.basicSalary) return alert('Please enter basic salary')
    setActionLoading(payrollModal.id)
    try {
      const basic = parseFloat(payrollForm.basicSalary)
      const deductions = parseFloat(payrollForm.deductions) || 0
      const bonus = parseFloat(payrollForm.bonus) || 0
      const netSalary = basic - deductions + bonus
      await API.post('/hr/payroll', {
        userId: payrollModal.id,
        month: selectedMonth,
        basicSalary: basic,
        deductions,
        bonus,
        netSalary
      })
      setPayrollModal(null)
      await refreshPayrolls()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save payroll')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkPaid = async (payrollId) => {
    setActionLoading(payrollId)
    try {
      await API.put(`/hr/payroll/${payrollId}/mark-paid`)
      await refreshPayrolls()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = employees.filter((e) =>
    filterCompany ? e.companyId === parseInt(filterCompany) : true
  )

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0)
  const paidCount = payrolls.filter((p) => p.isPaid).length

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">Manage payroll across all companies</p>
        </div>
        <div className="flex gap-3">
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
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-purple-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">${totalPayroll.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Total payroll</div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">{paidCount}</div>
          <div className="text-sm text-gray-500 mt-1">Paid</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">{employees.length - paidCount}</div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Employee</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Basic</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Deductions</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Bonus</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Net</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const payroll = getPayrollForEmployee(emp.id)
                return (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.role.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.company?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payroll ? `$${payroll.basicSalary}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payroll ? `$${payroll.deductions}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payroll ? `$${payroll.bonus}` : '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{payroll ? `$${payroll.netSalary}` : '—'}</td>
                    <td className="px-4 py-3">
                      {payroll ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${payroll.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {payroll.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPayrollModal(emp)
                            setPayrollForm({
                              basicSalary: payroll?.basicSalary || '',
                              deductions: payroll?.deductions || '0',
                              bonus: payroll?.bonus || '0',
                            })
                          }}
                          className="bg-purple-50 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          {payroll ? 'Edit' : 'Set'}
                        </button>
                        {payroll && !payroll.isPaid && (
                          <button
                            onClick={() => handleMarkPaid(payroll.id)}
                            disabled={actionLoading === payroll.id}
                            className="bg-green-50 text-green-600 border border-green-200 text-xs px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            Mark paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {payrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Set payroll</h3>
            <p className="text-sm text-gray-500 mb-4">{payrollModal.name} — {selectedMonth}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic salary ($)</label>
                <input
                  type="number"
                  value={payrollForm.basicSalary}
                  onChange={(e) => setPayrollForm({ ...payrollForm, basicSalary: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions ($)</label>
                <input
                  type="number"
                  value={payrollForm.deductions}
                  onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus ($)</label>
                <input
                  type="number"
                  value={payrollForm.bonus}
                  onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Net salary</span>
                  <span className="font-semibold text-gray-900">
                    ${(
                      (parseFloat(payrollForm.basicSalary) || 0) -
                      (parseFloat(payrollForm.deductions) || 0) +
                      (parseFloat(payrollForm.bonus) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPayrollModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayroll}
                disabled={actionLoading === payrollModal.id}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === payrollModal.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}