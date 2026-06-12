import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'
import useAuthStore from '../../store/authStore'

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  APPROVED: 'bg-purple-100 text-purple-700',
}

const statusIcons = {
  TODO: '📋',
  IN_PROGRESS: '⚙️',
  COMPLETED: '✅',
  APPROVED: '🎉',
}

export default function Tasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [assignableUsers, setAssignableUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    assignedToId: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const canCreate = ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  useEffect(() => {
    const getData = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          API.get('/tasks'),
          canCreate ? API.get('/tasks/assignable-users') : Promise.resolve({ data: [] })
        ])
        setTasks(tasksRes.data)
        setAssignableUsers(usersRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [canCreate])

  const refreshTasks = async () => {
    try {
      const res = await API.get('/tasks')
      setTasks(res.data)
      if (selectedTask) {
        const updated = res.data.find((t) => t.id === selectedTask.id)
        if (updated) setSelectedTask(updated)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async () => {
    if (!form.title.trim()) return alert('Please enter a title')
    if (!form.assignedToId) return alert('Please select an assignee')
    setSubmitting(true)
    try {
      await API.post('/tasks', {
        ...form,
        companyId: user.companyId
      })
      setShowCreateModal(false)
      setForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedToId: '' })
      await refreshTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId, status) => {
    setActionLoading(taskId)
    try {
      await API.put(`/tasks/${taskId}/status`, { status })
      await refreshTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    setActionLoading(taskId)
    try {
      await API.delete(`/tasks/${taskId}`)
      setSelectedTask(null)
      await refreshTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      await API.post(`/tasks/${selectedTask.id}/comments`, { content: newComment })
      setNewComment('')
      await refreshTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'TODO') return 'IN_PROGRESS'
    if (currentStatus === 'IN_PROGRESS') return 'COMPLETED'
    return null
  }

  const canApprove = (task) => {
    return task.status === 'COMPLETED' && task.createdById === user.id
  }

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus ? t.status === filterStatus : true
    const matchPriority = filterPriority ? t.priority === filterPriority : true
    return matchStatus && matchPriority
  })

  const myTasks = filtered.filter((t) => t.assignedToId === user.id)
  const createdTasks = filtered.filter((t) => t.createdById === user.id && t.assignedToId !== user.id)

  const isOverdue = (task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'APPROVED'
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} total tasks</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="APPROVED">Approved</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + Create task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* My Tasks */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              My tasks ({myTasks.length})
            </h2>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm">No tasks assigned to you</div>
                </div>
              ) : (
                myTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-purple-300 transition-colors ${
                      isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    } ${selectedTask?.id === task.id ? 'border-purple-400 ring-1 ring-purple-400' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {statusIcons[task.status]} {task.status.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {isOverdue(task) ? '⚠️ ' : ''}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.comments.length > 0 && (
                          <span className="text-xs text-gray-400">💬 {task.comments.length}</span>
                        )}
                      </div>
                    </div>
                    {getNextStatus(task.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, getNextStatus(task.status))
                        }}
                        disabled={actionLoading === task.id}
                        className="mt-3 w-full bg-purple-50 text-purple-600 border border-purple-200 text-xs py-1.5 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === task.id ? 'Updating...' : `Mark as ${getNextStatus(task.status).replace('_', ' ')}`}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks I Created */}
          {canCreate && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Tasks I created ({createdTasks.length})
              </h2>
              <div className="space-y-3">
                {createdTasks.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-sm">No tasks created yet</div>
                  </div>
                ) : (
                  createdTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-purple-300 transition-colors ${
                        isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      } ${selectedTask?.id === task.id ? 'border-purple-400 ring-1 ring-purple-400' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                          {statusIcons[task.status]} {task.status.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.dueDate && (
                            <span className={`text-xs ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.comments.length > 0 && (
                            <span className="text-xs text-gray-400">💬 {task.comments.length}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-500">{task.assignedTo.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {canApprove(task) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(task.id, 'APPROVED')
                              }}
                              disabled={actionLoading === task.id}
                              className="bg-green-50 text-green-600 border border-green-200 text-xs px-3 py-1 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id)
                            }}
                            disabled={actionLoading === task.id}
                            className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[selectedTask.priority]}`}>
                      {selectedTask.priority}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selectedTask.status]}`}>
                      {statusIcons[selectedTask.status]} {selectedTask.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedTask.description && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-sm text-gray-700">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Assigned to</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                      {selectedTask.assignedTo.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{selectedTask.assignedTo.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Created by</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                      {selectedTask.createdBy.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{selectedTask.createdBy.name}</span>
                  </div>
                </div>
                {selectedTask.dueDate && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Due date</h4>
                    <span className={`text-sm ${isOverdue(selectedTask) ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
                      {isOverdue(selectedTask) ? '⚠️ ' : ''}
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Created</h4>
                  <span className="text-sm text-gray-700">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-3">
                  Comments ({selectedTask.comments.length})
                </h4>
                <div className="space-y-3 mb-3">
                  {selectedTask.comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">No comments yet</div>
                  ) : (
                    selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700 flex-shrink-0">
                          {comment.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{comment.user.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {commentLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Task description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                <select
                  value={form.assignedToId}
                  onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select person...</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role.replace('_', ' ')} {u.company ? `(${u.company.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedToId: '' }) }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}