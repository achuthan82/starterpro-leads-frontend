import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Agent Service
 * Handles all real estate agent related API calls
 */
class AgentService {

  /**
   * Get Agent Dashboard Data
   * @returns {Promise} Response with dashboard metrics and data
   */
  async getDashboard() {
    const response = await axiosInstance.get(API_ENDPOINTS.AGENTS.DASHBOARD);
    return response.data;
  }

  /**
   * Get All Agents
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   * @returns {Promise} Response with paginated agents list
   */
  async getAgents(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.AGENTS.BASE, { params });
    return response.data;
  }

  /**
   * Get Agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise} Response with agent details
   */
  async getAgentById(agentId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}`);
    return response.data;
  }

  /**
   * Create New Agent Profile
   * @param {Object} agentData - Agent profile data
   * @returns {Promise} Response with created agent data
   */
  async createAgent(agentData) {
    const response = await axiosInstance.post(API_ENDPOINTS.AGENTS.BASE, agentData);
    return response.data;
  }

  /**
   * Update Agent Profile
   * @param {string} agentId - Agent ID
   * @param {Object} agentData - Updated agent data
   * @returns {Promise} Response with updated agent data
   */
  async updateAgent(agentId, agentData) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}`, agentData);
    return response.data;
  }

  /**
   * Delete Agent Profile
   * @param {string} agentId - Agent ID
   * @returns {Promise} Response confirming deletion
   */
  async deleteAgent(agentId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}`);
    return response.data;
  }

  /**
   * Get Agent's Property Listings
   * @param {Object} params - Query parameters (page, limit, status, type, etc.)
   * @returns {Promise} Response with agent's listings
   */
  async getAgentListings(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.AGENTS.LISTINGS, { params });
    return response.data;
  }

  /**
   * Get Agent's Clients
   * @param {Object} params - Query parameters (page, limit, status, type, etc.)
   * @returns {Promise} Response with agent's clients
   */
  async getAgentClients(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.AGENTS.CLIENTS, { params });
    return response.data;
  }

  /**
   * Get Agent Statistics
   * @param {Object} params - Date range and filter parameters
   * @returns {Promise} Response with agent statistics
   */
  async getAgentStats(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.AGENTS.STATS, { params });
    return response.data;
  }

  /**
   * Add Client to Agent
   * @param {Object} clientData - Client information
   * @returns {Promise} Response with added client data
   */
  async addClient(clientData) {
    const response = await axiosInstance.post(API_ENDPOINTS.AGENTS.CLIENTS, clientData);
    return response.data;
  }

  /**
   * Update Agent Commission Settings
   * @param {string} agentId - Agent ID
   * @param {Object} commissionData - Commission settings
   * @returns {Promise} Response with updated commission settings
   */
  async updateCommissionSettings(agentId, commissionData) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/commission`, commissionData);
    return response.data;
  }

  /**
   * Get Agent Performance Metrics
   * @param {string} agentId - Agent ID
   * @param {Object} params - Date range parameters
   * @returns {Promise} Response with performance metrics
   */
  async getPerformanceMetrics(agentId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/performance`, { params });
    return response.data;
  }

  /**
   * Schedule Agent Appointment
   * @param {string} agentId - Agent ID
   * @param {Object} appointmentData - Appointment details
   * @returns {Promise} Response with scheduled appointment
   */
  async scheduleAppointment(agentId, appointmentData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/appointments`, appointmentData);
    return response.data;
  }

  /**
   * Get Agent Appointments
   * @param {string} agentId - Agent ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with agent appointments
   */
  async getAppointments(agentId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/appointments`, { params });
    return response.data;
  }

  /**
   * Update Agent Availability
   * @param {string} agentId - Agent ID
   * @param {Object} availabilityData - Availability schedule
   * @returns {Promise} Response with updated availability
   */
  async updateAvailability(agentId, availabilityData) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/availability`, availabilityData);
    return response.data;
  }

  /**
   * Upload Agent Documents
   * @param {string} agentId - Agent ID
   * @param {FormData} documents - Document files
   * @returns {Promise} Response with uploaded documents
   */
  async uploadDocuments(agentId, documents) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.AGENTS.BASE}/${agentId}/documents`, documents, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Export singleton instance
export default new AgentService(); 