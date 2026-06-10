import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

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

export default function MonthlyAttendance() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [monthlyData, setMonthlyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [, setEmpLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await API.get('/hr/employees')
        setEmployees(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setEmpLoading(false)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    if (!selectedEmployee) return
    const getMonthlyData = async () => {
      setLoading(true)
      try {
        const res = await API.get(
          `/hr/attendance/monthly/${selectedEmployee}?month=${selectedMonth}`
        )
        setMonthlyData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getMonthlyData()
  }, [selectedEmployee, selectedMonth])

  const getDaysInMonth = (month) => {
    const [year, m] = month.split('-')
    return new Date(year, m, 0).getDate()
  }

  const getAttendanceForDay = (day) => {
    if (!monthlyData) return null
    return monthlyData.attendance.find((a) => {
      const d = new Date(a.date).getDate()
      return d === day
    })
  }

  const daysInMonth = getDaysInMonth(selectedMonth)
  const presentCount = monthlyData?.attendance.filter((a) => a.status === 'PRESENT').length || 0
  const lateCount = monthlyData?.attendance.filter((a) => a.status === 'LATE').length || 0
  const absentCount = monthlyData?.attendance.filter((a) => a.status === 'ABSENT').length || 0
  const halfDayCount = monthlyData?.attendance.filter((a) => a.status === 'HALF_DAY').length || 0
  const notMarkedCount = daysInMonth - (monthlyData?.attendance.length || 0)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Monthly attendance</h1>
        <p className="text-gray-500 text-sm mt-1">View full month attendance for any employee</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select employee...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} — {emp.role.replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {!selectedEmployee ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">👆</div>
          <div className="font-medium">Select an employee to view attendance</div>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : monthlyData && (
        <>
          {/* Employee info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-lg font-medium text-purple-700">
              {monthlyData.user.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{monthlyData.user.name}</div>
              <div className="text-sm text-gray-500">{monthlyData.user.role.replace('_', ' ')} — {monthlyData.user.email}</div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
              <div className="text-xl font-semibold text-gray-900">{presentCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Present</div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-3 text-center">
              <div className="text-xl font-semibold text-gray-900">{lateCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Late</div>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-3 text-center">
              <div className="text-xl font-semibold text-gray-900">{absentCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Absent</div>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-3 text-center">
              <div className="text-xl font-semibold text-gray-900">{halfDayCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Half day</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className="text-xl font-semibold text-gray-900">{notMarkedCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Not marked</div>
            </div>
          </div>

          {/* Calendar view */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs font-medium text-gray-400 text-center py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for first day offset */}
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
                    className={`rounded-lg p-2 text-center border ${
                      att
                        ? statusColors[att.status] + ' border-transparent'
                        : isToday
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className={`text-xs font-medium ${att ? '' : 'text-gray-400'}`}>
                      {day}
                    </div>
                    <div className="text-sm mt-0.5">
                      {att ? statusIcons[att.status] : ''}
                    </div>
                    {att?.checkIn && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap">
              {Object.entries(statusIcons).map(([status, icon]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-gray-500">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Detailed log</h3>
            </div>
            {monthlyData.attendance.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No attendance records</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Check in</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Check out</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.attendance.map((att) => {
                    const hours = att.checkIn && att.checkOut
                      ? ((new Date(att.checkOut) - new Date(att.checkIn)) / 3600000).toFixed(1)
                      : null
                    return (
                      <tr key={att.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(att.date).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[att.status]}`}>
                            {att.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {hours ? `${hours} hrs` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}