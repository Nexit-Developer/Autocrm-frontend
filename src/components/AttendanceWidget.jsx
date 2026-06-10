import { useState, useEffect } from 'react'
import API from '../api/axios'
import useAuthStore from '../store/authStore'

export default function AttendanceWidget() {
  const { user } = useAuthStore()
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Super admin is not an employee — no attendance
  if (user?.role === 'SUPER_ADMIN') return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/hr/attendance/my-today')
        setAttendance(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const res = await API.post('/hr/attendance/checkin')
      setAttendance({ checkIn: res.data.checkIn, status: res.data.status })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const res = await API.post('/hr/attendance/checkout')
      setAttendance((prev) => ({ ...prev, checkOut: res.data.checkOut }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check out')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (time) => {
    if (!time) return '—'
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const statusColors = {
    PRESENT: 'bg-green-100 text-green-700',
    LATE: 'bg-amber-100 text-amber-700',
    ABSENT: 'bg-red-100 text-red-700',
    HALF_DAY: 'bg-blue-100 text-blue-700',
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-xl">
            🕐
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Today's attendance</div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {attendance && (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">Check in</div>
                <div className="text-sm font-medium text-gray-900">{formatTime(attendance.checkIn)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">Check out</div>
                <div className="text-sm font-medium text-gray-900">{formatTime(attendance.checkOut)}</div>
              </div>
              {attendance.status && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[attendance.status]}`}>
                  {attendance.status}
                </span>
              )}
            </>
          )}
          {!attendance && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              {actionLoading ? 'Checking in...' : '✅ Check in'}
            </button>
          )}
          {attendance && !attendance.checkOut && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium"
            >
              {actionLoading ? 'Checking out...' : '🚪 Check out'}
            </button>
          )}
          {attendance && attendance.checkOut && (
            <span className="text-sm text-gray-500 font-medium">✅ Done for today</span>
          )}
        </div>
      </div>
    </div>
  )
}