import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import { ordersService } from 'utils/apiService';
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  EnvelopeIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const AgentOrders = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state
  const { userId, agentName, agentEmail } = location.state || {};
  
  const [agent, setAgent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Check if we have required data
  useEffect(() => {
    if (!userId) {
      setError('No user ID provided. Please navigate from the Agent Management page.');
      setLoading(false);
      return;
    }

    // Set agent data from navigation state
    setAgent({
      id: agentId,
      name: agentName || `Agent ${agentId}`,
      email: agentEmail || 'Email not available',
      user_id: userId
    });

    // Load initial data
    if (activeTab === 'orders') {
      fetchAgentOrders(1, perPage, 'all');
    } else {
      fetchAgentSubscriptions();
    }
  }, [agentId, userId, agentName, agentEmail, activeTab]);

  const fetchAgentOrders = async (page, per_page, status) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm.trim()) {
        response = await ordersService.searchUserOrders(userId, searchTerm.trim(), currentPage, perPage);
      } else {
        response = await ordersService.getUserOrders(status, userId, page, per_page);
      }
      
      console.log('Orders response:', response);
      
      // Handle different response formats
      const ordersData = response.data || response.orders || [];
      
      // Extract pagination info
      const pagination = response.pagination || {};
      const total = pagination.total || response.total || response.total_count || response.count || ordersData.length;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);
      
      setOrders(ordersData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error('Error fetching agent orders:', err);
      setError(`Failed to fetch orders: ${err.message}`);
      setOrders([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentSubscriptions = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm.trim()) {
        response = await ordersService.searchUserSubscriptions(userId, searchTerm.trim(), currentPage, perPage);
      } else {
        response = await ordersService.getUserSubscriptions(userId, currentPage, perPage);
      }
      
      console.log('Subscriptions response:', response);
      
      // Handle different response formats
      const subscriptionsData = response.data || response.subscriptions || [];
      
      // Extract pagination info
      const pagination = response.pagination || {};
      const total = pagination.total || response.total || response.total_count || response.count || subscriptionsData.length;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);
      
      setSubscriptions(subscriptionsData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error('Error fetching agent subscriptions:', err);
      setError(`Failed to fetch subscriptions: ${err.message}`);
      setSubscriptions([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    if (activeTab === 'orders') {
      fetchAgentOrders();
    } else {
      fetchAgentSubscriptions();
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
        if (activeTab === 'orders') {
      fetchAgentOrders(newPage, perPage, statusFilter);
    } else {
      fetchAgentSubscriptions();
    }
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
      if (activeTab === 'orders') {
      fetchAgentOrders(1, newPerPage, statusFilter);
    } else {
      fetchAgentSubscriptions();
    }
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Handle close order modal
  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const currentData = activeTab === 'orders' ? orders : subscriptions;
  
  // Apply status filter if needed
  const filteredData = statusFilter === 'all' 
    ? currentData 
    : currentData.filter(item => {
        const status = item.payment_status || item.status;
        return status?.toLowerCase() === statusFilter.toLowerCase();
      });

  // Handle search on Enter key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && document.activeElement.type === 'text') {
        handleSearch();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [searchTerm, activeTab]);

  // Show error state
  if (error && !userId) {
    return (
      <div className="flex h-screen bg-[var(--color-ecru-white)]">
        <SharedSidebar currentPath="/admin/agents" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md mx-auto text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/agents')}
              className="bg-[var(--color-atoll)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-atoll)]/90"
            >
              Back to Agent Management
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/agents" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/agents')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-atoll)]">
                  Orders & Subscriptions
                </h1>
                <p className="text-gray-600 mt-1">
                  {agent?.name} - View purchases and subscriptions
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Agent Info Banner */}
        {agent && (
          <div className="bg-gradient-to-r from-[var(--color-atoll)] to-[var(--color-fern)] text-white p-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{agent.name}</h2>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{agent.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Agent ID: {agentId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">User ID: {userId}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-8 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-white/80">Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-white/80">Subscriptions</p>
                  <p className="text-2xl font-bold">{subscriptions.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => handleTabChange('orders')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'orders'
                  ? 'bg-[var(--color-atoll)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => handleTabChange('subscriptions')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'subscriptions'
                  ? 'bg-[var(--color-atoll)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCardIcon className="w-5 h-5" />
              <span>Subscriptions</span>
            </button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  {
                    activeTab !== 'orders' && <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:border-[var(--color-atoll)] focus:outline-none ${
                        searchTerm.trim() ? 'border-[var(--color-atoll)] bg-blue-50' : 'border-gray-300'
                      }`}
                    />
                    {searchTerm.trim() && (
                      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 text-xs text-[var(--color-atoll)] font-medium">
                        Active
                      </div>
                    )}
                    <button 
                      onClick={handleSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80 font-medium"
                    >
                      Search
                    </button>
                  </div>
                  }
                 
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1); fetchAgentOrders(1, perPage, e.target.value) }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[var(--color-atoll)] focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    {activeTab === 'orders' ? (
                      <>
                        <option value="succeeded">Succeeded</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </>
                    ) : (
                      <>
                        <option value="active">Active</option>
                        <option value="canceled">Canceled</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                      </>
                    )}
                  </select>

                  <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[var(--color-atoll)] focus:outline-none"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Info Row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {totalRecords > 0 && (
                    <>Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalRecords)} of {totalRecords} {activeTab}</>
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && userId && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Data Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'orders' ? `Order` : 'Subscription'}
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'orders' ? 'Product' : 'Plan'}
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading {activeTab}...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No {activeTab} found for this agent
                        {searchTerm && (
                          <div className="mt-2">
                            <button
                              onClick={() => {setSearchTerm(''); handleSearch();}}
                              className="text-[var(--color-atoll)] hover:underline text-sm"
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {activeTab === 'orders' ? (
                                <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                              ) : (
                                <CreditCardIcon className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              {/* <div className="text-sm font-medium text-gray-900">
                                #{item.id || item.acknowledgement_id || 'N/A'}
                              </div> */}
                              <div className="text-xs text-gray-500">
                                {activeTab === 'orders' ? 'Order' : 'Subscription'}
                                {activeTab === 'orders' && (
                                  <div className="text-xs text-gray-500">
                                    #{item.id || item.stripe_payment_id || 'N/A'}
                                  </div>
                                )}
                                {activeTab === 'subscriptions' && (
                                  <div className="text-xs text-gray-500">
                                    #{item.name || item.stripe_subscription_id || 'N/A'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.product_name || item.plan_name || item.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description || item.plan_description || ''}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activeTab !== 'subscriptions' &&
                          <div className="font-medium">
                            ${item.amount_received || 0}
                          </div>
                          }
                          {activeTab === 'subscriptions' && item.billing_cycle && (
                            <div className="text-xs text-gray-500">
                              per {item.billing_cycle}
                            </div>
                          )}
                          {activeTab === 'subscriptions' && item.total_amount && (
                            <div className="font-medium">
                              ${item.total_amount || 0}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span style={{textTransform: 'capitalize'}} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.payment_status || item.status)}`}>
                            {item.payment_status || item.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {item.created_at || item.start_date || item.order_date
                                ? new Date(item.created_at || item.start_date || item.order_date).toLocaleDateString() 
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewOrder(item)}
                            className="text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80 flex items-center space-x-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} results (Page {currentPage} of {totalPages})
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-3 py-1 rounded border ${
                      currentPage <= 1
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Page Numbers */}
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded border ${
                          currentPage === pageNum
                            ? 'border-[var(--color-atoll)] bg-[var(--color-atoll)] text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 rounded border ${
                      currentPage >= totalPages
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600/65 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-lg bg-white mb-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[var(--color-atoll)]">
                {activeTab === 'orders' ? 'Order Details' : 'Subscription Details'}
              </h3>
              <button 
                onClick={handleCloseOrderModal} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-6">
              <div className="space-y-4">
                {/* Order/Subscription ID */}
                {
                  activeTab !== 'subscriptions' ? (<div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">ID:</span>
                  <span className="text-sm text-gray-900">#{selectedOrder.id || selectedOrder.stripe_payment_id || 'N/A'}</span>
                </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <span className="text-sm text-gray-900">#{selectedOrder.acknowledgment_id || selectedOrder.stripe_subscription_id || 'N/A'}</span>
                  </div>
                )}
              

                {/* Name/Product */}
                {/* <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {activeTab === 'orders' ? 'Name:' : 'Plan:'}
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">
                    {selectedOrder.product_name || selectedOrder.plan_name || selectedOrder.name || 'N/A'}
                  </span>
                </div> */}

                {/* Plan */}
                {selectedOrder.name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Plan:</span>
                    <span className="text-sm text-gray-900">{selectedOrder.name}</span>
                  </div>
                )}

                {/* Category */}
                {selectedOrder.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <span className="text-sm text-gray-900">{selectedOrder.category}</span>
                  </div>
                )}

                {/* Source */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Source:</span>
                  <span className="text-sm text-gray-900">{selectedOrder.source || 'NEW MTG'}</span>
                </div>

                {/* States */}
                {selectedOrder.states_chosen && selectedOrder.states_chosen.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">States Chosen:</span>
                    <span className="text-sm text-gray-900">{selectedOrder.states_chosen.join(', ')}</span>
                  </div>
                )}

                {/* Fresh Leads (for orders) */}
                {activeTab === 'orders' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Fresh Leads:</span>
                    <span className="text-sm text-gray-900">
                      {selectedOrder.is_fresh_leads || selectedOrder.fresh_leads ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}

                {/* Quantity (for orders) */}
                {activeTab === 'orders' && selectedOrder.quantity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Quantity:</span>
                    <span className="text-sm text-gray-900">{selectedOrder.quantity}</span>
                  </div>
                )}

                {/* Amount Received */}
                

                {/* Orginal Price */}
                  {selectedOrder.net_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Net Price:</span>
                      <p className="text-sm text-gray-900">${selectedOrder.net_price}</p>
                    </div>
                  )}

                  {/* Discount Price */}
                  {selectedOrder.discounted_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Discount Price:</span>
                      <p className="text-sm text-gray-900">${selectedOrder.discounted_price}</p>
                    </div>
                  )}

                  {/* Amount Received */}
                  {selectedOrder?.amount_received && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Amount Received:
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      ${selectedOrder.amount_received || '0'}
                    </span>
                  </div>
                  )}

                {/* Status */}
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-600">Status:</span>
                   <span style={{textTransform: 'capitalize'}} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.payment_status || selectedOrder.status)}`}>
                     {selectedOrder.payment_status || selectedOrder.status || 'pending'}
                   </span>
                 </div>

                {/* Date */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {activeTab === 'orders' ? 'Order Date:' : 'Created Date:'}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedOrder.created_at || selectedOrder.start_date
                      ? new Date(selectedOrder.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                {/* Start Date */}
                {selectedOrder.started_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                   Started At
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedOrder.started_at
                      ? new Date(selectedOrder.started_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                )}

                {/* Cancel Date */}
                {(selectedOrder.cancel_at || selectedOrder.cancelled_at) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Cancel Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedOrder.cancel_at || selectedOrder.cancelled_at
                      ? new Date(selectedOrder.cancel_at || selectedOrder.cancelled_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                )}

                {/* Cancel Reason */}
                {(selectedOrder.cancel_reason || selectedOrder.cancellation_reason) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Cancel Reason:</span>
                    <p className="text-sm text-gray-900">{selectedOrder.cancel_reason || selectedOrder.cancellation_reason}</p>
                  </div>
                )}

                {/* Description */}
                {selectedOrder.description && (
                  <div className="border-t border-gray-200 pt-4">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Description:</span>
                    <p className="text-sm text-gray-900">{selectedOrder.description}</p>
                  </div>
                )}

                {/* Additional fields for subscriptions */}
                {activeTab === 'subscriptions' && (
                  <>
                    {selectedOrder.end_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">End Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedOrder.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedOrder.next_billing_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Next Billing:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedOrder.next_billing_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <button 
                onClick={handleCloseOrderModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentOrders; 