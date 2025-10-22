import axiosInstance from './axios';
import { JWT_HOST_API } from 'configs/auth.config';

class OrderSubscriptionService {
  /**
   * Get paginated orders for a user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters (timezone, page, per_page, payment_status, search)
   * @returns {Promise} Response with paginated orders
   */
  async getOrders(userId, params = {}) {
    try {
      const queryParams = {
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      console.log('OrderSubscriptionService.getOrders - Making request to:', `${JWT_HOST_API}/marketplace/orders/${userId}/paginated`);
      console.log('OrderSubscriptionService.getOrders - Query params:', queryParams);

      const response = await axiosInstance.get(`${JWT_HOST_API}/marketplace/orders/${userId}/paginated`, {
        params: queryParams
      });

      console.log('OrderSubscriptionService.getOrders - Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get paginated subscriptions for a user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters (timezone, page, per_page, status, search)
   * @returns {Promise} Response with paginated subscriptions
   */
  async getSubscriptions(userId, params = {}) {
    try {
      const queryParams = {
        timezone: params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      console.log('OrderSubscriptionService.getSubscriptions - Making request to:', `${JWT_HOST_API}/stripe-subscriptions/paginated/${userId}`);
      console.log('OrderSubscriptionService.getSubscriptions - Query params:', queryParams);

      const response = await axiosInstance.get(`${JWT_HOST_API}/stripe-subscriptions/paginated/${userId}`, {
        params: queryParams
      });

      console.log('OrderSubscriptionService.getSubscriptions - Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get order details by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} Response with order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/marketplace/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Get subscription details by ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise} Response with subscription details
   */
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/stripe-subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  }
}

export default new OrderSubscriptionService(); 