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
        lead_status = '',
        state='',
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
      if (state && state !== 'all') {
        queryParams.state = state
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

  /**
   * Get wallet balance
   * @returns {Promise} Response with wallet balance data
   */
  async getWalletBalance() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DIALER.WALLET_BALANCE);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session for wallet recharge
   * @param {Object} params - Recharge parameters
   * @param {number} params.recharged_amount - Amount to recharge
   * @param {number} params.total_amount - Total amount including commission
   * @param {string} params.success_url - Success redirect URL
   * @param {string} params.cancel_url - Cancel redirect URL
   * @returns {Promise} Response with Stripe session data
   */
  async createWalletRechargeSession(params) {
    try {
      const response = await axiosInstance.post(
        '/stripe/wallet-recharge-create-checkout-session',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error creating wallet recharge session:', error);
      throw error;
    }
  }

  /**
   * Get number pricing list
   * @returns {Promise} Response with pricing data for different number types
   */
  async getNumberPricing() {
    try {
      const response = await axiosInstance.get('/twilio-management/number-pricing-list');
      return response.data;
    } catch (error) {
      console.error('Error fetching number pricing:', error);
      throw error;
    }
  }

  /**
   * Get available phone numbers from Twilio
   * @param {Object} params - Filter parameters
   * @param {string} params.type - Number type: 'toll-free' or 'local'
   * @param {string} params.state - State code (e.g., 'CA') - only used when type is 'local'
   * @param {string} params.area_code - Area code (e.g., '212') - only used when type is 'local'
   * @returns {Promise} Response with list of available phone numbers
   */
  async getAvailableNumbers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.type) {
        queryParams.append('type', params.type);
      }
      
      if (params.state) {
        queryParams.append('state', params.state);
      }
      
      if (params.area_code) {
        queryParams.append('area_code', params.area_code);
      }
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `/twilio-management/available-numbers?${queryString}`
        : '/twilio-management/available-numbers';
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching available numbers:', error);
      throw error;
    }
  }

  /**
   * Purchase a phone number from Twilio
   * @param {Object} params - Purchase parameters
   * @param {string} params.phone - Phone number to purchase (e.g., "+18001234567")
   * @param {string} params.friendly_name - Friendly name for the number
   * @param {string} params.number_type - Number type: 'local' or 'toll-free'
   * @returns {Promise} Response with purchased number data
   */
  async purchaseNumber(params) {
    try {
      const response = await axiosInstance.post(
        '/twilio-management/purchase-number',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error purchasing number:', error);
      throw error;
    }
  }

  /**
   * Update a phone number's friendly name
   * @param {string|number} numberId - The ID of the number to update
   * @param {Object} params - Update parameters
   * @param {string} params.friendly_name - New friendly name
   * @returns {Promise} Response with updated number data
   */
  async updateNumber(numberId, params) {
    try {
      const response = await axiosInstance.patch(
        `/twilio-management/update-number/${numberId}`,
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error updating number:', error);
      throw error;
    }
  }

  /**
   * Delete a phone number
   * @param {string|number} numberId - The ID of the number to delete
   * @returns {Promise} Response from delete operation
   */
  async deleteNumber(numberId) {
    try {
      const response = await axiosInstance.delete(
        `/twilio-management/delete-number/${numberId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting number:', error);
      throw error;
    }
  }

  /**
 * Convert file to AWS Base64 using backend
 * @param {string} fileUrl - Presigned S3 File URL
 * @returns {Promise} Response with base64 string
 */
async getAwsBase64(fileUrl) {
  try {
    const response = await axiosInstance.get('/carriers/aws-bas64', {
      params: { file_url: fileUrl }
    });
    return response.data;
  } catch (error) {
    console.error('Error converting file to Base64:', error);
    throw error;
  }
}

}

const dialerService = new DialerService();
export default dialerService;

