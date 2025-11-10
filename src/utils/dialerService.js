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
}

const dialerService = new DialerService();
export default dialerService;

