import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Policy() {
  const { user } = useAuthStore()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const canEdit = ['HR', 'SUPER_ADMIN', 'ADMIN'].includes(user?.role)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/policy')
        setPolicy(res.data)
        if (res.data) {
          setForm({ title: res.data.title, content: res.data.content })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Please enter a title')
    if (!form.content.trim()) return alert('Please enter the policy content')
    setSubmitting(true)
    try {
      await API.post('/policy', form)
      const res = await API.get('/policy')
      setPolicy(res.data)
      setEditing(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save policy')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Company policy</h1>
          <p className="text-gray-500 text-sm mt-1">Official company rules and guidelines</p>
        </div>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            {policy ? 'Edit policy' : 'Create policy'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Company Rules and Guidelines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={15}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
                placeholder="Write the company policy here..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setEditing(false)
                if (policy) setForm({ title: policy.title, content: policy.content })
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save policy'}
            </button>
          </div>
        </div>
      ) : policy ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{policy.title}</h2>
              <p className="text-xs text-gray-400 mt-1">
                Last updated by <span className="font-medium text-gray-600">{policy.updatedBy?.name}</span> on {new Date(policy.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {policy.content}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-medium">No policy created yet</div>
          {canEdit && (
            <div className="text-sm mt-1">Create a company policy for all employees to read</div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}