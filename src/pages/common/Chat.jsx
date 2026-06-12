/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { io } from 'socket.io-client'

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  HR: 'bg-pink-100 text-pink-700',
  MANAGER: 'bg-amber-100 text-amber-700',
  TEAM_LEAD: 'bg-orange-100 text-orange-700',
  AGENT: 'bg-green-100 text-green-700',
}

let socket = null

export default function Chat() {
  const { user } = useAuthStore()
  const [availableUsers, setAvailableUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const selectedUserRef = useRef(null)

  useEffect(() => {
    // Connect socket
    socket = io('https://autocrm-backend-production.up.railway.app')
    socket.emit('join', user.id)

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
  if (
    selectedUserRef.current &&
    (message.senderId === selectedUserRef.current.id ||
      message.receiverId === selectedUserRef.current.id)
  ) {
    setMessages((prev) => {
      const updated = [...prev, message]
      messageCache.current[selectedUserRef.current.id] = updated
      return updated
    })
  }
  refreshConversations()
})

    socket.on('message_sent', (message) => {
  setMessages((prev) => {
    const updated = [...prev, message]
    // Update cache
    if (selectedUserRef.current) {
      messageCache.current[selectedUserRef.current.id] = updated
    }
    return updated
  })
  setSending(false)
  setNewMessage('')
  refreshConversations()
})

    socket.on('message_error', () => {
      setSending(false)
      alert('Failed to send message')
    })

    // Fetch initial data
    const getData = async () => {
      try {
        const [usersRes, convsRes] = await Promise.all([
          API.get('/messages/users/available'),
          API.get('/messages/conversations'),
        ])
        setAvailableUsers(usersRes.data)
        setConversations(convsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [user.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const refreshConversations = async () => {
    try {
      const res = await API.get('/messages/conversations')
      setConversations(res.data)
    } catch (err) {
      console.error(err)
    }
  }

const messageCache = useRef({})

const handleSelectUser = async (selectedU) => {
  setSelectedUser(selectedU)
  selectedUserRef.current = selectedU

  // Show cached messages instantly if available
  if (messageCache.current[selectedU.id]) {
    setMessages(messageCache.current[selectedU.id])
    setMessagesLoading(false)
  } else {
    setMessagesLoading(true)
  }

  try {
    const res = await API.get(`/messages/${selectedU.id}`)
    // Update cache
    messageCache.current[selectedU.id] = res.data
    setMessages(res.data)
    socket.emit('mark_read', { senderId: selectedU.id, receiverId: user.id })
    await refreshConversations()
  } catch (err) {
    console.error(err)
  } finally {
    setMessagesLoading(false)
  }
}

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || sending) return
    setSending(true)
    socket.emit('send_message', {
      senderId: user.id,
      receiverId: selectedUser.id,
      content: newMessage.trim()
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConversationUser = (conv) => conv.user
  const getUnreadCount = (userId) => {
    const conv = conversations.find((c) => c.user.id === userId)
    return conv?.unreadCount || 0
  }

  const allUsers = availableUsers.map((u) => ({
    user: u,
    lastMessage: conversations.find((c) => c.user.id === u.id)?.lastMessage || null,
    unreadCount: getUnreadCount(u.id)
  })).sort((a, b) => {
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    }
    if (a.lastMessage) return -1
    if (b.lastMessage) return 1
    return 0
  })

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
        <p className="text-gray-500 text-sm mt-1">Internal messaging</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left panel — user list */}
        <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No users available</div>
            ) : (
              allUsers.map(({ user: u, lastMessage, unreadCount }) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedUser?.id === u.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-700">
                      {u.name.charAt(0)}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{u.name}</span>
                      {lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColors[u.role]}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel — chat */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-700">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{selectedUser.name}</div>
                <div className="text-xs text-gray-400">{selectedUser.role.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-sm">No messages yet — say hello!</div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="px-4 py-3 border-t border-gray-200 flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <div className="font-medium text-gray-600">Select a conversation</div>
              <div className="text-sm mt-1">Choose someone to start chatting</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}