import { useState } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Profile() {
  const { user, login } = useAuthStore()
  const [activeTab, setActiveTab] = useState('info')
  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [infoLoading, setInfoLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [infoError, setInfoError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleUpdateInfo = async () => {
    if (!infoForm.name.trim()) return setInfoError('Name is required')
    setInfoLoading(true)
    setInfoError('')
    setInfoSuccess('')
    try {
      const res = await API.put('/auth/profile', infoForm)
      login(res.data.user, localStorage.getItem('token'))
      setInfoSuccess('Profile updated successfully!')
    } catch (err) {
      setInfoError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setInfoLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword) return setPasswordError('Enter current password')
    if (passwordForm.newPassword.length < 8) return setPasswordError('New password must be at least 8 characters')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setPasswordError('Passwords do not match')
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')
    try {
      await API.put('/auth/change-password', passwordForm)
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    HR: 'bg-pink-100 text-pink-700',
    MANAGER: 'bg-amber-100 text-amber-700',
    TEAM_LEAD: 'bg-orange-100 text-orange-700',
    AGENT: 'bg-green-100 text-green-700',
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      <div className="max-w-2xl">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-semibold text-purple-700">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
                {user?.company && (
                  <span className="text-xs text-gray-400">
                    {user.company.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Personal info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Change password
          </button>
        </div>

        {/* Personal info tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Personal information</h3>

            {infoSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
                {infoSuccess}
              </div>
            )}
            {infoError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {infoError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={user?.company?.name || 'Nexit Solution'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateInfo}
              disabled={infoLoading}
              className="mt-6 bg-purple-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
            >
              {infoLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Change password tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Change password</h3>

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={passwordLoading}
              className="mt-6 bg-purple-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
            >
              {passwordLoading ? 'Changing...' : 'Change password'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}