import axios from './axios';
import { JWT_HOST_API } from 'configs/auth.config';

/**
 * SMS Service
 * Handles all SMS-related API calls
 */
class SmsService {
  /**
   * Get paginated list of leads with SMS
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {string} params.name - Optional filter for name/mortgage_id
   * @returns {Promise} Response with paginated leads list
   */
  async getSentLeadsPaginated(params = {}) {
    try {
      const { page = 1, per_page = 10, name } = params;
      const requestParams = {
        page,
        per_page,
      };
      
      // Add name param only if provided
      if (name) {
        requestParams.name = name;
      }
      
      const response = await axios.get(
        `${JWT_HOST_API}/sms-automation/list-sent-leads/paginated`,
        {
          params: requestParams,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sent leads:', error);
      throw error;
    }
  }

  /**
   * Get paginated SMS conversation
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {string|number} params.mailing_assignee_id - Lead member ID
   * @param {string} params.time_zone - Timezone (default: UTC)
   * @returns {Promise} Response with paginated conversation
   */
  async getConversationPaginated(params = {}) {
    try {
      const { page = 1, per_page = 10, mailing_assignee_id, time_zone = 'UTC' } = params;
      const response = await axios.get(
        `${JWT_HOST_API}/sms-automation/list-sms-conversation/paginated`,
        {
          params: {
            page,
            per_page,
            mailing_assignee_id,
            time_zone,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching SMS conversation:', error);
      throw error;
    }
  }
}

const smsService = new SmsService();
export default smsService;

