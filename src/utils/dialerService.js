import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Dialer Service
 * Handles all power dialer related API calls
 */
class DialerService {
  /**
   * Get paginated leads for power dialer
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {string} params.name - Optional search filter by name
   * @param {string|number} params.lead_status - Optional status filter
   * @returns {Promise} Response with paginated leads list
   */
  async getPaginatedLeads(params = {}) {
    try {
      const {
        page = 1,
        per_page = 10,
        name = '',
        lead_status = ''
      } = params;

      // Build query parameters
      const queryParams = {
        page,
        per_page
      };

      // Add optional filters only if they have values
      if (name && name.trim()) {
        queryParams.name = name.trim();
      }

      if (lead_status && lead_status !== 'All Statuses' && lead_status !== 'all') {
        queryParams.lead_status = lead_status;
      }

      const response = await axiosInstance.get(API_ENDPOINTS.DIALER.PAGINATED_LEADS, {
        params: queryParams
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching paginated leads for dialer:', error);
      throw error;
    }
  }

  /**
   * Get outbound numbers from database
   * @returns {Promise} Response with list of outbound numbers
   */
  async getOutboundNumbers() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DIALER.OUTBOUND_NUMBERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching outbound numbers:', error);
      throw error;
    }
  }

  /**
   * Initialize Twilio by getting access token
   * @param {Object} params - Parameters for Twilio initialization
   * @param {string} params.to_number - Phone number of the lead being called
   * @param {string|number} params.mortgage_id - Mortgage ID of the selected lead
   * @param {string} params.uuid - UUID4 generated on frontend
   * @returns {Promise} Response with Twilio token
   */
  async initializeTwilio(params) {
    try {
      const { to_number, mortgage_id, uuid } = params;
      const response = await axiosInstance.post(API_ENDPOINTS.DIALER.TOKEN, {
        to_number,
        mortgage_id,
        uuid
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing Twilio:', error);
      throw error;
    }
  }

  /**
   * Get call logs (call history and transcripts)
   * @param {Object} params - Parameters for fetching call logs
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 100)
   * @param {string|number} params.mortgage_id - Optional mortgage ID to filter by lead
   * @returns {Promise} Response with call logs data
   */
  async getCallLogs(params = {}) {
    try {
      const { page = 1, per_page = 100, mortgage_id } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      if (mortgage_id) {
        queryParams.append('mortgage_id', mortgage_id.toString());
      }
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.DIALER.CALL_LOGS}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching call logs:', error);
      throw error;
    }
  }

  /**
   * Save Mortgage Protection Assessment data entry
   * @param {string} callLogId - UUID of the call log
   * @param {Object} data - Assessment data to save
   * @returns {Promise} Response from API
   */
  async saveDataEntry(callLogId, data) {
    try {
      const response = await axiosInstance.post(
        `${API_ENDPOINTS.DIALER.DATA_ENTRY}/${callLogId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error saving data entry:', error);
      throw error;
    }
  }
}

const dialerService = new DialerService();
export default dialerService;

