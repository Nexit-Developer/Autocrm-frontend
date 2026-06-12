import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { onMessageListener } from '../firebase'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
  const listenToMessages = async () => {
    try {
      const payload = await onMessageListener()
      setUnreadCount((prev) => prev + 1)
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo.png'
        })
      }
    } catch (err) {
      console.error(err)
    }
  }
  listenToMessages()
}, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await API.get('/notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = async () => {
    setShowDropdown(!showDropdown)
    if (!showDropdown) {
      await fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/mark-all-read')
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await API.put(`/notifications/${notification.id}/read`)
        setNotifications((prev) =>
          prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error(err)
      }
    }

    // Navigate to link
    if (notification.link) {
      setShowDropdown(false)
      navigate(notification.link)
    }
  }

  const typeIcons = {
    INFO: '📋',
    WARNING: '⚠️',
    ALERT: '🚨',
    SUCCESS: '✅',
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🔔</div>
                  <div className="text-sm">No notifications yet</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                      n.link ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${!n.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <span className="text-lg flex-shrink-0">{typeIcons[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                        {n.link && (
                          <span className="text-xs text-purple-600">View →</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}