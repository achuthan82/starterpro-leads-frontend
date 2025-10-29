import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import { adminService } from 'utils/apiService';
import {
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  XMarkIcon,
  // PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AgentManagement = () => {
  const randomColors = [
    "#0a2463", "#5ab453", "#92c933", "#FF2ECF", "#E000AD", "#FFA71A", "#FF4F1A",
    "#384766", "#506877", "#3D4E70", "#4A4A4F", "#6D7EA1", "#70838F", "#B8008C", "#FF75DF"
  ];

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeAgents, setActiveAgents] = useState(null)
  const [leadDetails, setLeadDetails] = useState({completed:0, incomplete:0, sold:0})
  // Define fetchAgents with useCallback before using it in useEffect
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        // limit: 10,
        // search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      if (searchTerm) {
        params['search'] = searchTerm
      }
      console.log('Fetching agents with params:', params);
      const response = await adminService.getAgents(params);
      console.log('Agents API response:', response);

      // Handle different response formats
      let agentsData = [];
      let totalPagesCount = 1;

      if (response.data) {
        agentsData = Array.isArray(response.data) ? response.data : [];
        // Check for pagination object first, then fallback to other formats
        if (response.pagination) {
          totalPagesCount = Math.ceil(response.pagination.total / response.pagination.per_page);
        } else {
          totalPagesCount = response.totalPages || response.total_pages || 1;
        }
      } else if (Array.isArray(response)) {
        agentsData = response;
      } else if (response.agents) {
        agentsData = Array.isArray(response.agents) ? response.agents : [];
        if (response.pagination) {
          totalPagesCount = Math.ceil(response.pagination.total / response.pagination.per_page);
        } else {
          totalPagesCount = response.totalPages || response.total_pages || 1;
        }
      }

      console.log('Processed agents data:', agentsData);
      console.log('Total pages calculated:', totalPagesCount);
      setAgents(agentsData);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error('Error fetching agents:', error);

      // Handle authentication errors
      if (error.status === 401 || error.message?.includes('login')) {
        console.log('Authentication error - redirecting to login');
        navigate('/login');
        return;
      }

      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, navigate]);

  const agentCount = () => {
    adminService.getAgentCount().then((response) => {
      if (response.status === 200) {
        setActiveAgents(response.data.active)
        setTotalAgents((response.data.active || 0) + (response.data.inactive || 0))
      } else {
        setActiveAgents(null)
        setTotalAgents(null)
      }
    }).catch(() => {
      setActiveAgents(null)
      setTotalAgents(null)

    })
  }
  const getSalesCount = () => {
    adminService.getAgentSalesCount().then((response) => {
      if (response.status === 200) {
        setLeadDetails(response.data)
      } else {
        setLeadDetails({completed:0, incomplete:0, sold:0})
      }
    }).catch(() => {
        setLeadDetails({completed:0, incomplete:0, sold:0})

    })
  }
  useEffect(() => {
    // Check if we have a valid token before making API calls
    const token = localStorage.getItem('authToken');
    if (!token || token === 'authenticated') {
      console.log('No valid token found, redirecting to login');
      navigate('/login');
      return;
    }
    fetchAgents();
  }, [fetchAgents, currentPage, statusFilter, navigate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchAgents();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAgents]);
  useEffect(() => {
    agentCount()
    getSalesCount()
  }, [])
  const handleViewLeads = (agentId, user_id) => {
    navigate(`/admin/agents/${agentId}/leads?user=${user_id}`);
  };

  const handleViewOrders = (agent) => {
    // Pass both agentId and userId to the orders page
    const userId = agent.user_id || agent.id; // Use user_id if available, fallback to agent id
    navigate(`/admin/agents/${agent.id}/orders`, {
      state: {
        agentId: agent.id,
        userId: userId,
        agentName: agent.name,
        agentEmail: agent.email
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-[#0a2463] text-white',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-[#f4d03f] text-white',
      suspended: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  // Don't filter locally since API handles filtering
  const filteredAgents = agents;

  const [totalAgents, setTotalAgents] = useState('');
  // const activeAgents = agents.filter(a => a.is_active).length;

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/agents" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">Agent Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage insurance agents and their performance</p>
            </div>
            {/* <div className="flex items-center space-x-3">
              <button 
                onClick={() => alert('Add Agent functionality would be implemented here')}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            </div> */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[0]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Agents</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{totalAgents || 'N/A'}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg1 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[1]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Agents</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{activeAgents || 'N/A'}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg2 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[2]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{leadDetails?.completed + leadDetails?.incomplete}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg3 rounded-full flex items-center justify-center">
                  {/* <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg> */}
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid oklch(64.6% 0.222 41.116)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{(((leadDetails?.sold)/(leadDetails?.sold + leadDetails?.completed + leadDetails?.incomplete)) * 100).toFixed(2) || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-6 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[var(--color-atoll)] focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-3">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#75150b] focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Authentication Warning */}
          {localStorage.getItem('authToken') === 'authenticated' && (
            <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
                    <p className="text-sm text-yellow-700">Please log in again to access agent data from the API.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Login Again
                </button>
              </div>
            </Card>
          )}

          {/* Agents Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Territories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">Loading agents...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No agents found
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* <div className="flex items-center">
                            <div className="w-10 h-10 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {agent.name?.split(' ').map(n => n[0]).join('') || 'A'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {agent.id}</div>
                            </div>
                          </div> */}

                          <div className="flex items-center">
                            {/* <div className="w-10 h-10 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {lead.full_name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div> */}
                            {(() => {
                              const color = randomColors[filteredAgents.indexOf(agent) % randomColors.length];
                              return (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <span className="text-white font-medium text-sm">
                                    {agent.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {agent.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{agent.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{agent.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(agent.is_active ? 'active' : 'inactive')}`}>
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{agent.role || 'Agent'}</div> */}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div>Leads: {agent.totalLeads || 0}</div>
                          <div>Conversions: {agent.conversions || 0}</div>
                          <div className="text-green-600">Rate: {agent.conversionRate || 0}%</div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(agent.states_chosen || []).map((territory, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {territory}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleViewLeads(agent.id, agent.user_id)}
                              className="text-[var(--color-atoll)] dark:text-blue-400 hover:text-[var(--color-atoll)] dark:text-blue-400/80 text-xs flex items-center space-x-1"
                            >
                              <EyeIcon className="w-3 h-3" />
                              <span>View Leads</span>
                            </button>
                            <button
                              onClick={() => handleViewOrders(agent)}
                              className="text-[var(--color-fern)] hover:text-[var(--color-fern)]/80 text-xs flex items-center space-x-1"
                            >
                              <EyeIcon className="w-3 h-3" />
                              <span>View Orders</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalAgents)} of {totalAgents} agents
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${currentPage === pageNum
                                ? 'bg-[var(--color-atoll)] text-white'
                                : 'border border-gray-300 hover:bg-gray-50 dark:bg-gray-700'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-gray-600/65 overflow-y-auto h-full w-full z-50" style={{ width: ' 100vw' }}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white dark:bg-gray-800 mb-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{selectedAgent.avatar}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">{selectedAgent.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{selectedAgent.role} • {selectedAgent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <span>{selectedAgent.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span>{selectedAgent.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span>Joined: {selectedAgent.joinDate}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span>Territories: {selectedAgent.territories.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Leads</span>
                      <span className="font-medium">{selectedAgent.totalLeads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Conversions</span>
                      <span className="font-medium">{selectedAgent.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Revenue Generated</span>
                      <span className="font-medium text-green-600">${selectedAgent.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Conversion Rate</span>
                      <span className="font-medium">{selectedAgent.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Login</span>
                      <span className="font-medium">{selectedAgent.lastLogin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 space-x-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-[var(--color-atoll)] text-white rounded-md hover:bg-[var(--color-atoll)]/90">
                Edit Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement; 