import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Admin Service
 * Handles all admin-related API calls
 */
class AdminService {

  /**
   * Get Admin Dashboard Data
   * @returns {Promise} Response with dashboard analytics and metrics
   */
  async getAdminDashboard() {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  }

  /**
   * Get All Users (Admin View) - Paginated
   * @param {Object} params - Query parameters (page, limit, search, role, status, etc.)
   * @returns {Promise} Response with paginated users list
   */
  async getUsers(params = {}) {
    const queryParams = {
      page: params.page || 1,
      per_page: params.limit || 10,
      ...params
    };
    
    console.log('AdminService.getUsers - Making request to:', API_ENDPOINTS.ADMIN.USER_PAGINATED_LIST);
    console.log('AdminService.getUsers - Query params:', queryParams);
    console.log('AdminService.getUsers - Auth token exists:', !!localStorage.getItem('authToken'));
    
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USER_PAGINATED_LIST, { 
      params: queryParams 
    });
    
    console.log('AdminService.getUsers - Raw response:', response);
    console.log('AdminService.getUsers - Response data:', response.data);
    console.log('AdminService.getUsers - Response pagination:', response.data?.pagination);
    return response.data;
  }

  
  /**
   * Invite New User
   * @param {Object} userData - User invitation data (email, role, name, etc.)
   * @returns {Promise} Response confirming user invitation
   */
  async inviteUser(userData) {
    console.log('AdminService.inviteUser - Inviting user:', userData);
    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.USER_INVITE, userData);
    return response.data;
  }

  async getActiveInactiveCount() {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.ACTIVE_INACTIVE);
    return response.data;
  }

  /**
   * Edit User
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user information
   */
  async editUser(userId, userData) {
    console.log('AdminService.editUser - Editing user:', userId, userData);
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.USER_EDIT}/${userId}`, userData);
    return response.data;
  }
  
    async inviteAgain(userId) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.USER.INVITE_AGAIN}/${userId}`,{});
    return response.data;
  }
  /**
   * Get User Details by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with detailed user information
   */
  async getUserDetails(userId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
    return response.data;
  }

  /**
   * Update User Status
   * @param {string} userId - User ID
   * @param {string} status - New status (active, inactive, suspended, banned)
   * @returns {Promise} Response with updated user status
   */
  async updateUserStatus(userId, status) {
    console.log('AdminService.updateUserStatus - Updating status:', userId, status);
    const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.USER_STATUS_UPDATE, { 
      user_id: userId, 
      status: status 
    });
    return response.data;
  }

  /**
   * Make User Active/Inactive
   * @param {string} userId - User ID
   * @param {boolean} isActive - Whether to make user active (true) or inactive (false)
   * @returns {Promise} Response with updated user status
   */
  async makeUserActiveInactive(userId, isActive) {
    console.log('AdminService.makeUserActiveInactive - Updating user:', userId, 'isActive:', isActive);
    const response = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.USER_ACTIVE_INACTIVE}/${userId}`, { 
      is_active: isActive 
    });
    return response.data;
  }

  /**
   * Update User Role
   * @param {string} userId - User ID
   * @param {string} role - New role (user, agent, admin)
   * @returns {Promise} Response with updated user role
   */
  async updateUserRole(userId, role) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Delete User Account (Admin)
   * @param {string} userId - User ID
   * @returns {Promise} Response confirming user deletion
   */
  async deleteUser(userId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
    return response.data;
  }

  /**
   * Get All Agents (Admin View)
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   * @returns {Promise} Response with paginated agents list
   */
  async getAgents(params = {}) {
    // Use the correct agents filter endpoint with required parameters
    const queryParams = {
      category_id: 1, // Default category for agents
      page: params.page || 1,
      per_page: params.limit || 10,
      ...params
    };
    
    console.log('AdminService.getAgents - Making request to:', API_ENDPOINTS.ADMIN.AGENTS_FILTER);
    console.log('AdminService.getAgents - Query params:', queryParams);
    console.log('AdminService.getAgents - Auth token exists:', !!localStorage.getItem('authToken'));
    
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.AGENTS_FILTER, { 
      params: queryParams 
    });
    
    console.log('AdminService.getAgents - Raw response:', response);
    console.log('AdminService.getAgents - Response data:', response.data);
    console.log('AdminService.getAgents - Response pagination:', response.data?.pagination);
    return response.data;
  }

  /**
   * Approve Agent Application
   * @param {string} agentId - Agent ID
   * @returns {Promise} Response confirming agent approval
   */
  async approveAgent(agentId) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.AGENTS}/${agentId}/approve`);
    return response.data;
  }

  /**
   * Reject Agent Application
   * @param {string} agentId - Agent ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Response confirming agent rejection
   */
  async rejectAgent(agentId, reason) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.AGENTS}/${agentId}/reject`, { reason });
    return response.data;
  }

  /**
   * Suspend Agent
   * @param {string} agentId - Agent ID
   * @param {string} reason - Suspension reason
   * @returns {Promise} Response confirming agent suspension
   */
  async suspendAgent(agentId, reason) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.AGENTS}/${agentId}/suspend`, { reason });
    return response.data;
  }

  /**
   * Get Agent Details
   * @param {string} agentId - Agent ID
   * @returns {Promise} Response with detailed agent information
   */
  async getAgentDetails(agentId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.AGENTS}/${agentId}`);
    return response.data;
  }

  /**
   * Get Agent Leads
   * @param {string} agentId - Agent ID
   * @param {Object} params - Query parameters (page, limit, status, dateRange)
   * @returns {Promise} Response with agent's leads
   */
  async getAgentLeads(agentId, params = {}) {
    const endpoint = API_ENDPOINTS.ADMIN.AGENT_LEADS.replace(':agentId', agentId);
    const response = await axiosInstance.get(endpoint, { params });
    console.log('AdminService.getAgentLeads - Raw response:---', response);
    return response.data;
  }

  /**
   * Get Agent Orders/Purchases
   * @param {string} agentId - Agent ID
   * @param {Object} params - Query parameters (page, limit, status, dateRange)
   * @returns {Promise} Response with agent's orders and purchases
   */
  async getAgentOrders(agentId, params = {}) {
    const endpoint = API_ENDPOINTS.ADMIN.AGENT_ORDERS.replace(':agentId', agentId);
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  }

  /**
   * Get Agent Subscriptions
   * @param {string} agentId - Agent ID
   * @param {Object} params - Query parameters (page, limit, status)
   * @returns {Promise} Response with agent's subscriptions
   */
  async getAgentSubscriptions(agentId, params = {}) {
    const endpoint = API_ENDPOINTS.ADMIN.AGENT_SUBSCRIPTIONS.replace(':agentId', agentId);
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  }

  /**
   * Get All Properties (Admin View)
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   * @returns {Promise} Response with paginated properties list
   */
  async getProperties(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PROPERTIES, { params });
    return response.data;
  }

  /**
   * Approve Property Listing
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response confirming property approval
   */
  async approveProperty(propertyId) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/approve`);
    return response.data;
  }

  /**
   * Reject Property Listing
   * @param {string} propertyId - Property ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Response confirming property rejection
   */
  async rejectProperty(propertyId, reason) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/reject`, { reason });
    return response.data;
  }

  /**
   * Feature Property
   * @param {string} propertyId - Property ID
   * @param {boolean} featured - Featured status
   * @returns {Promise} Response confirming property feature update
   */
  async featureProperty(propertyId, featured) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/feature`, { featured });
    return response.data;
  }

  /**
   * Get System Reports
   * @param {Object} params - Report parameters (type, dateRange, format)
   * @returns {Promise} Response with system reports
   */
  async getReports(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS, { params });
    return response.data;
  }

  /**
   * Generate Custom Report
   * @param {Object} reportData - Report configuration
   * @returns {Promise} Response with generated report
   */
  async generateReport(reportData) {
    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.REPORTS, reportData);
    return response.data;
  }

  /**
   * Get System Analytics
   * @param {Object} params - Analytics parameters (dateRange, metrics)
   * @returns {Promise} Response with system analytics
   */
  async getSystemAnalytics(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/analytics`, { params });
    return response.data;
  }

  /**
   * Get Financial Overview
   * @param {Object} params - Date range parameters
   * @returns {Promise} Response with financial data
   */
  async getFinancialOverview(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/financial`, { params });
    return response.data;
  }

  /**
   * Manage System Settings
   * @param {Object} settings - System settings object
   * @returns {Promise} Response with updated settings
   */
  async updateSystemSettings(settings) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.DASHBOARD}/settings`, settings);
    return response.data;
  }

  /**
   * Get System Settings
   * @returns {Promise} Response with current system settings
   */
  async getSystemSettings() {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/settings`);
    return response.data;
  }

  /**
   * Get Platform Statistics
   * @param {Object} params - Statistics parameters
   * @returns {Promise} Response with platform statistics
   */
  async getPlatformStats(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/stats`, { params });
    return response.data;
  }

  /**
   * Manage Content Moderation
   * @param {Object} params - Moderation parameters
   * @returns {Promise} Response with content requiring moderation
   */
  async getContentModeration(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/moderation`, { params });
    return response.data;
  }

  /**
   * Send System Notification
   * @param {Object} notificationData - Notification details
   * @returns {Promise} Response confirming notification sent
   */
  async sendSystemNotification(notificationData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.DASHBOARD}/notifications`, notificationData);
    return response.data;
  }

  /**
   * Export Data
   * @param {Object} exportParams - Export configuration
   * @returns {Promise} Response with export file
   */
  async exportData(exportParams) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.DASHBOARD}/export`, exportParams, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get Audit Logs
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with audit logs
   */
  async getAuditLogs(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}/audit-logs`, { params });
    return response.data;
  }
    async getAgentCount(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.AGENT_COUNT}`, { params });
    return response.data;
  }
  async getAgentSalesCount(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.AGENT_SALES_COUNT}`, { params });
    return response.data;
  }
}

// Export singleton instance
export default new AdminService(); 