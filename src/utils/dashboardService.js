import axiosInstance from './axios';
import { JWT_HOST_API } from 'configs/auth.config';

class DashboardService {

  /**
   * Get Dashboard Count by Category
   * @param {number} category - Category ID (default: 1)
   * @returns {Promise} Response with territories data
   */
  async getDashboardCount(category = 1) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/dashboard/count/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard count:', error);
      throw error;
    }
  }

  /**
   * Get recent leads for dashboard
   * @param {number} limit - Number of leads to fetch
   * @returns {Promise} Response with recent leads
   */
  async getRecentLeads(limit = 3) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(`${JWT_HOST_API}/dashboard/recent-leads`, {
        params: { limit },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent leads:', error);
      throw error;
    }
  }

  /**
   * Get Twilio wallet balance
   * @returns {Promise} Response with Twilio wallet balance
   */
  async getTwilioWalletBalance() {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/dashboard/twilio-wallet-balance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Twilio wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet recharge sum for date range
   * @param {string} startDate - Start date in mm-dd-YYYY format
   * @param {string} endDate - End date in mm-dd-YYYY format
   * @returns {Promise} Response with total recharge amount
   */
  async getWalletRechargeSum(startDate, endDate) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/dashboard/wallet-recharge-sum`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet recharge sum:', error);
      throw error;
    }
  }

  /**
   * Get wallet usage breakdown by event type
   * @param {string} startDate - Start date in mm-dd-YYYY format
   * @param {string} endDate - End date in mm-dd-YYYY format
   * @returns {Promise} Response with usage breakdown data
   */
  async getWalletUsageBreakdown(startDate, endDate) {
    try {
      const response = await axiosInstance.get(
        `${JWT_HOST_API}/dashboard/wallet-usage-sum-grouped-event`,
        {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet usage breakdown:", error);
      throw error;
    }
  }

  /**
   * Get agent-wise wallet usage
   * @param {string} startDate - Start date in mm-dd-YYYY format
   * @param {string} endDate - End date in mm-dd-YYYY format
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @param {string} name - Agent name search filter
   * @returns {Promise} Response with agent usage data
   */
  async getAgentWiseUsage(startDate, endDate, page = 1, perPage = 10, name = "") {
    try {
      const response = await axiosInstance.get(
        `${JWT_HOST_API}/dashboard/wallet-user-wise-usage`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            page,
            per_page: perPage,
            name
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching agent-wise usage:", error);
      throw error;
    }
  }

  /**
   * Get daily wallet usage grouped by event (for line chart)
   * @param {string} startDate - Start date in mm-dd-YYYY format
   * @param {string} endDate - End date in mm-dd-YYYY format
   * @returns {Promise} Daily usage data
   */
  async getDailySpend(startDate, endDate) {
    try {
      const response = await axiosInstance.get(
        `${JWT_HOST_API}/dashboard/wallet-usage-daily`,
        {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching daily wallet usage:", error);
      throw error;
    }
  }

  /**
   * Download cost charge sum data for date range
   * @param {string} startDate - Start date in mm-dd-YYYY format
   * @param {string} endDate - End date in mm-dd-YYYY format
   * @returns {Promise} Blob response with cost charge data
   */
  async downloadCostChargeSum(startDate, endDate) {
    try {
      const response = await axiosInstance.get(
        `${JWT_HOST_API}/dashboard/download-cost-charge-sum`,
        {
          params: {
            start_date: startDate,
            end_date: endDate
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading cost charge sum:", error);
      throw error;
    }
  }

  /**
   * Get wallet deduction history with filters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 100)
   * @param {number|null} event - Event type ID (1-6 or null for all)
   * @param {string|null} startDate - Start date in mm-dd-YYYY format
   * @param {string|null} endDate - End date in mm-dd-YYYY format
   * @param {string} timeZone - Time zone (default: Asia/Kolkata)
   * @returns {Promise} Response with deduction history data
   */
  async getDeductionHistory(page = 1, perPage = 100, event = null, startDate = null, endDate = null, timeZone = 'Asia/Kolkata') {
    try {
      const params = {
        page,
        per_page: perPage,
        time_zone: timeZone
      };

      // Add optional parameters if provided
      if (event !== null && event !== 'all') {
        params.event = event;
      }
      
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axiosInstance.get(
        `${JWT_HOST_API}/wallet/deduction-history`,
        { params }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching deduction history:", error);
      throw error;
    }
  }

  /**
   * Export deduction history to CSV
   * @param {number|null} event - Event type ID (1-6 or null for all)
   * @param {string|null} startDate - Start date in mm-dd-YYYY format
   * @param {string|null} endDate - End date in mm-dd-YYYY format
   * @param {string} timeZone - Time zone (default: Asia/Kolkata)
   * @returns {Promise} Blob response with CSV data
   */
  async exportDeductionHistory(event = null, startDate = null, endDate = null, timeZone = 'Asia/Kolkata') {
    try {
      const params = {
        time_zone: timeZone,
        per_page: 10000 // Large number to get all data
      };

      // Add optional parameters if provided
      if (event !== null && event !== 'all') {
        params.event = event;
      }
      
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axiosInstance.get(
        `${JWT_HOST_API}/wallet/deduction-history`,
        {
          params,
          responseType: 'blob' // Important for downloading files
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error exporting deduction history:", error);
      throw error;
    }
  }

  /**
   * Get deduction summary statistics
   * @param {number|null} event - Event type ID (1-6 or null for all)
   * @param {string|null} startDate - Start date in mm-dd-YYYY format
   * @param {string|null} endDate - End date in mm-dd-YYYY format
   * @returns {Promise} Response with summary statistics
   */
  async getDeductionSummary(event = null, startDate = null, endDate = null) {
    try {
      const params = {};
      
      // Add optional parameters if provided
      if (event !== null && event !== 'all') {
        params.event = event;
      }
      
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axiosInstance.get(
        `${JWT_HOST_API}/wallet/deduction-summary`,
        { params }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching deduction summary:", error);
      throw error;
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;