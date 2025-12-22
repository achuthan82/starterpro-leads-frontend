import axiosInstance from './axios';
import { JWT_HOST_API } from 'configs/auth.config';
// import { getToken } from './jwt';

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

}


// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService; 