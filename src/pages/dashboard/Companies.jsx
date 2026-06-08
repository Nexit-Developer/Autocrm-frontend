import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [addForm, setAddForm] = useState({ name: '' })
  const [editForm, setEditForm] = useState({ name: '' })

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/admin/companies')
        setCompanies(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshCompanies = async () => {
    try {
      const res = await API.get('/admin/companies')
      setCompanies(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCompany = async () => {
    if (!addForm.name.trim()) return alert('Please enter company name')
    setActionLoading('add')
    try {
      await API.post('/admin/companies', addForm)
      setShowAddModal(false)
      setAddForm({ name: '' })
      await refreshCompanies()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add company')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditCompany = async () => {
    if (!editForm.name.trim()) return alert('Please enter company name')
    setActionLoading(editModal.id)
    try {
      await API.put(`/admin/companies/${editModal.id}`, editForm)
      setEditModal(null)
      await refreshCompanies()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (company) => {
    if (!window.confirm(`Are you sure you want to ${company.isActive ? 'deactivate' : 'activate'} ${company.name}?`)) return
    setActionLoading(company.id)
    try {
      await API.put(`/admin/companies/${company.id}/toggle-active`)
      await refreshCompanies()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all companies under Nexit Solution</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Add company
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`bg-white rounded-xl border p-5 ${
                company.isActive ? 'border-gray-200' : 'border-red-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-xl font-bold text-purple-700">
                  {company.name.charAt(0)}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  company.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {company.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-xs text-gray-400 mb-4">
                Added {new Date(company.createdAt).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditModal(company)
                    setEditForm({ name: company.name })
                  }}
                  className="flex-1 bg-purple-50 text-purple-600 border border-purple-200 text-xs py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(company)}
                  disabled={actionLoading === company.id}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    company.isActive
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                  }`}
                >
                  {company.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Add company</h3>
            <p className="text-sm text-gray-500 mb-4">Add a new sub-company under Nexit Solution</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company name
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Zenki Motors"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setAddForm({ name: '' }) }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompany}
                disabled={actionLoading === 'add'}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading === 'add' ? 'Adding...' : 'Add company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit company</h3>
            <p className="text-sm text-gray-500 mb-4">
              Editing <span className="font-medium text-gray-700">{editModal.name}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Company name"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCompany}
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