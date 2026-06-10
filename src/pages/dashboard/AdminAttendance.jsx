import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import AttendanceWidget from '../../components/AttendanceWidget'
import useAuthStore from '../../store/authStore'

const statusColors = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-amber-100 text-amber-700',
  HALF_DAY: 'bg-blue-100 text-blue-700',
}

const statusIcons = {
  PRESENT: '✅',
  ABSENT: '❌',
  LATE: '⏰',
  HALF_DAY: '🌓',
}


export default function AdminAttendance() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [monthlyModal, setMonthlyModal] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  useEffect(() => {
    const getData = async () => {
      try {
        const [empRes, attRes] = await Promise.all([
          API.get('/hr/employees'),
          API.get(`/hr/attendance?date=${selectedDate}`),
        ])
        setEmployees(empRes.data)
        setAttendance(attRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [selectedDate])

  const getAttendanceForEmployee = (employeeId) => {
    return attendance.find((a) => a.userId === employeeId)
  }

  const handleOpenMonthly = async (emp) => {
    setMonthlyModal(emp)
    setMonthlyLoading(true)
    try {
      const res = await API.get(
        `/hr/attendance/monthly/${emp.id}?month=${selectedMonth}`
      )
      setMonthlyData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setMonthlyLoading(false)
    }
  }

  const handleMonthChange = async (month) => {
    setSelectedMonth(month)
    if (!monthlyModal) return
    setMonthlyLoading(true)
    try {
      const res = await API.get(
        `/hr/attendance/monthly/${monthlyModal.id}?month=${month}`
      )
      setMonthlyData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setMonthlyLoading(false)
    }
  }

  const getDaysInMonth = (month) => {
    const [year, m] = month.split('-')
    return new Date(year, m, 0).getDate()
  }

  const getAttendanceForDay = (day) => {
    if (!monthlyData) return null
    return monthlyData.attendance.find((a) => new Date(a.date).getDate() === day)
  }

  const today = new Date().toISOString().split('T')[0]
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length
  const absentCount = employees.length - attendance.length
  const lateCount = attendance.filter((a) => a.status === 'LATE').length
  const daysInMonth = getDaysInMonth(selectedMonth)

  const presentMonthly = monthlyData?.attendance.filter((a) => a.status === 'PRESENT').length || 0
  const lateMonthly = monthlyData?.attendance.filter((a) => a.status === 'LATE').length || 0
  const absentMonthly = monthlyData?.attendance.filter((a) => a.status === 'ABSENT').length || 0
  const halfDayMonthly = monthlyData?.attendance.filter((a) => a.status === 'HALF_DAY').length || 0
  const { user } = useAuthStore()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Your attendance and company overview</p>
      </div>

      {user?.role !== 'SUPER_ADMIN' && <AttendanceWidget />}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Company attendance</h2>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">{presentCount}</div>
          <div className="text-sm text-gray-500 mt-1">Present today</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">{absentCount}</div>
          <div className="text-sm text-gray-500 mt-1">Absent today</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="text-2xl font-semibold text-gray-900">{lateCount}</div>
          <div className="text-sm text-gray-500 mt-1">Late today</div>
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
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Check in</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Check out</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const att = getAttendanceForEmployee(emp.id)
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOpenMonthly(emp)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      {att ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[att.status]}`}>
                          {att.status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          Not checked in
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {att?.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {att?.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly Modal */}
      {monthlyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-700">
                  {monthlyModal.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{monthlyModal.name}</div>
                  <div className="text-xs text-gray-400">{monthlyModal.role.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => { setMonthlyModal(null); setMonthlyData(null) }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-medium"
                >
                  ✕
                </button>
              </div>
            </div>

            {monthlyLoading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : monthlyData && (
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
                    <div className="text-xl font-semibold text-gray-900">{presentMonthly}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Present</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
                    <div className="text-xl font-semibold text-gray-900">{lateMonthly}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Late</div>
                  </div>
                  <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
                    <div className="text-xl font-semibold text-gray-900">{absentMonthly}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Absent</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
                    <div className="text-xl font-semibold text-gray-900">{halfDayMonthly}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Half day</div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-xs font-medium text-gray-400 text-center py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                  {Array.from({ length: new Date(`${selectedMonth}-01`).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const att = getAttendanceForDay(day)
                    const isToday =
                      new Date().toISOString().slice(0, 7) === selectedMonth &&
                      new Date().getDate() === day
                    return (
                      <div
                        key={day}
                        className={`rounded-lg p-1.5 text-center border ${
                          att
                            ? statusColors[att.status] + ' border-transparent'
                            : isToday
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className={`text-xs font-medium ${att ? '' : 'text-gray-400'}`}>{day}</div>
                        <div className="text-xs mt-0.5">{att ? statusIcons[att.status] : ''}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Detailed log</h3>
                  </div>
                  {monthlyData.attendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No records this month</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2">Date</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2">Status</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2">Check in</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2">Check out</th>
                          <th className="text-left text-xs font-medium text-gray-500 px-4 py-2">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.attendance.map((att) => {
                          const hours = att.checkIn && att.checkOut
                            ? ((new Date(att.checkOut) - new Date(att.checkIn)) / 3600000).toFixed(1)
                            : null
                          return (
                            <tr key={att.id} className="border-b border-gray-100 last:border-0">
                              <td className="px-4 py-2 text-xs text-gray-900">
                                {new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[att.status]}`}>
                                  {att.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                {hours ? `${hours} hrs` : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}