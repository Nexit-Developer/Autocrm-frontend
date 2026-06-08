import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

export default function ManagerTeam() {
  const [teamLeads, setTeamLeads] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('teamleads')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const [teamLeadsRes, agentsRes] = await Promise.all([
          API.get('/manager/team-leads'),
          API.get('/manager/agents'),
        ])
        setTeamLeads(teamLeadsRes.data)
        setAgents(agentsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshData = async () => {
    try {
      const [teamLeadsRes, agentsRes] = await Promise.all([
        API.get('/manager/team-leads'),
        API.get('/manager/agents'),
      ])
      setTeamLeads(teamLeadsRes.data)
      setAgents(agentsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePromote = async (agentId, agentName) => {
    if (!window.confirm(`Promote ${agentName} to Team Lead?`)) return
    setActionLoading(agentId)
    try {
      await API.put(`/manager/promote/${agentId}`)
      await refreshData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My team</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage team leads and agents in your company
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('teamleads')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'teamleads'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Team leads ({teamLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'agents'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Agents ({agents.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {activeTab === 'teamleads' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {teamLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="font-medium">No team leads yet</div>
                  <div className="text-sm mt-1">Promote agents to team lead from the Agents tab</div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Leads assigned</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamLeads.map((tl) => (
                      <tr key={tl.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
                              {tl.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{tl.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tl.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tl._count?.assignedLeads || 0} leads
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {agents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">👤</div>
                  <div className="font-medium">No agents yet</div>
                  <div className="text-sm mt-1">Agents will appear here once approved by admin</div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Leads assigned</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                              {agent.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{agent.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {agent._count?.assignedLeads || 0} leads
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handlePromote(agent.id, agent.name)}
                            disabled={actionLoading === agent.id}
                            className="bg-amber-50 text-amber-600 border border-amber-200 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === agent.id ? 'Promoting...' : 'Promote to Team Lead'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}